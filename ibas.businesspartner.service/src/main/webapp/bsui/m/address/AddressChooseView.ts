/**
 * @license
 * Copyright Color-Coding Studio. All Rights Reserved.
 *
 * Use of this source code is governed by an Apache License, Version 2.0
 * that can be found in the LICENSE file at http://www.apache.org/licenses/LICENSE-2.0
 */
namespace businesspartner {
    export namespace ui {
        export namespace m {
            export class AddressChooseView extends ibas.BOChooseView implements app.IAddressChooseView {
                /** 返回查询的对象 */
                get queryTarget(): any {
                    return bo.Address;
                }
                /** 绘制工具条 */
                drawBars(): any {
                    let that: this = this;
                    return [
                        // new sap.m.ToolbarSpacer(""),
                        new sap.m.Button("", {
                            width: "50%",
                            text: ibas.i18n.prop("shell_data_choose"),
                            type: sap.m.ButtonType.Transparent,
                            // icon: "sap-icon://accept",
                            press: function (): void {
                                that.fireViewEvents(that.chooseDataEvent,
                                    // 获取表格选中的对象
                                    openui5.utils.getSelecteds<bo.Address>(that.list)
                                );
                            }
                        }),
                        // new sap.m.ToolbarSpacer(""),
                        new sap.m.Button("", {
                            width: "50%",
                            text: ibas.i18n.prop("shell_exit"),
                            type: sap.m.ButtonType.Transparent,
                            // icon: "sap-icon://inspect-down",
                            press: function (): void {
                                that.fireViewEvents(that.closeEvent);
                            }
                        }),
                        // new sap.m.ToolbarSpacer(""),
                    ];
                }
                /** 绘制视图 */
                draw(): any {
                    let that: this = this;
                    this.list = new sap.m.List("", {
                        inset: false,
                        growing: true,
                        growingThreshold: ibas.config.get(openui5.utils.CONFIG_ITEM_LIST_TABLE_VISIBLE_ROW_COUNT, 15),
                        growingScrollToLoad: true,
                        visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                        mode: openui5.utils.toListMode(this.chooseType)
                    });
                    let list_item_object: sap.m.ObjectListItem = new sap.m.ObjectListItem("", {
                        title: "{name} ",
                        type: sap.m.ListType.Active,
                        numberUnit: "{mobilePhone}",
                        attributes: [
                            new sap.m.ObjectAttribute("", {
                            }).bindProperty("text", {
                                path: "contacts",
                                formatter(data: any): any {
                                    return ibas.i18n.prop("bo_address_contacts") + data;
                                }
                            }),
                        ],
                    });
                    this.list.bindItems({
                        path: "/rows",
                        template: list_item_object,
                    });
                    this.page = new sap.m.Page("", {
                        showHeader: false,
                        floatingFooter: true,
                        content: [this.list],
                        footer: new sap.m.Toolbar("", {
                            content: this.drawBars()
                        })
                    });
                    this.page.setShowSubHeader(false);
                    this.id = this.page.getId();
                    openui5.utils.triggerNextResults({
                        listener: this.list,
                        next(data: any): void {
                            if (ibas.objects.isNull(that.lastCriteria)) {
                                return;
                            }
                            let criteria: ibas.ICriteria = that.lastCriteria.next(data);
                            if (ibas.objects.isNull(criteria)) {
                                return;
                            }
                            ibas.logger.log(ibas.emMessageLevel.DEBUG, "result: {0}", criteria.toString());
                            that.fireViewEvents(that.fetchDataEvent, criteria);
                        }
                    });
                    return new sap.m.Dialog("", {
                        title: this.title,
                        type: sap.m.DialogType.Standard,
                        state: sap.ui.core.ValueState.None,
                        stretchOnPhone: true,
                        horizontalScrolling: true,
                        verticalScrolling: true,
                        content: [this.page],
                    });
                }
                /** 嵌入查询面板 */
                embedded(view: any): void {
                    this.page.addHeaderContent(view);
                    this.page.setShowHeader(true);
                }
                confirm(): void {
                    this.fireViewEvents(this.chooseDataEvent,
                        // 获取表格选中的对象
                        openui5.utils.getSelecteds<bo.Address>(this.list)
                    );
                }
                private page: sap.m.Page;
                private form: sap.ui.layout.VerticalLayout;
                private list: sap.m.List;
                /** 显示数据 */
                showData(datas: bo.Address[]): void {
                    let done: boolean = false;
                    let model: sap.ui.model.Model = this.list.getModel(undefined);
                    if (!ibas.objects.isNull(model)) {
                        // 已存在绑定数据，添加新的
                        let hDatas: any = (<any>model).getData();
                        if (!ibas.objects.isNull(hDatas) && hDatas.rows instanceof Array) {
                            for (let item of datas) {
                                hDatas.rows.push(item);
                            }
                            model.refresh(false);
                            done = true;
                            done = true;
                        }
                    }
                    if (!done) {
                        // 没有显示数据
                        this.list.setModel(new sap.ui.model.json.JSONModel({ rows: datas }));
                    }
                    this.list.setBusy(false);
                }

                /** 记录上次查询条件，表格滚动时自动触发 */
                query(criteria: ibas.ICriteria): void {
                    super.query(criteria);

                    // 清除历史数据
                    if (this.isDisplayed) {
                        this.list.setBusy(true);
                        this.list.setSelectedItemById("0", true);
                        this.list.setModel(null);
                    }
                }
                /** 获取选择的数据 */
                getSelecteds(): bo.Address[] {
                    return null;
                }
                /** 手指触控滑动 */
                onTouchMove(direcction: ibas.emTouchMoveDirection, event: TouchEvent): void {
                    if (direcction === ibas.emTouchMoveDirection.UP) {
                        this.page.setShowFooter(false);
                    } else if (direcction === ibas.emTouchMoveDirection.DOWN) {
                        this.page.setShowFooter(true);
                    }
                }
            }
        }
    }
}