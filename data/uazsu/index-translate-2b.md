# uazsu/Index-Translate-2B

## Resumen

Index-Translate-2B es un modelo compacto de traduccion multilingue de 2.274 millones de parametros desarrollado por el equipo Index (Bilibili), construido sobre la arquitectura Qwen3.5. Forma parte de la familia Index-Translate, que incluye variantes de 2B, 9B y un modelo MoE de 35B con 3B activos. El modelo cubre traduccion de texto en 150 idiomas y sigue instrucciones de traduccion que implican terminologia, formato, estilo, estructura, contexto y longitud de salida.

El modelo resuelve el problema de la traduccion automatica de alta calidad en un rango de parametros muy contenido, lo que permite su despliegue en hardware modesto. Ademas de la traduccion de texto general, soporta traduccion de imagenes de extremo a extremo sin herramientas OCR externas, gracias a codificadores visuales complementarios (`mmproj`). Incorpora restricciones duras (glosarios estrictos, preservacion de JSON, CSV, markdown, bloques de codigo y placeholders) y restricciones blandas (adaptacion de tono, desambiguacion por dominio y contexto).

Su relevancia actual radica en que supera al modelo Hy-MT2-1.8B en todas las metricas principales de traduccion reportadas y se acerca a modelos mucho mayores en varios benchmarks, manteniendo una licencia Apache 2.0 permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer denso, segun tag `qwen3_5`) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 150 idiomas (inventario documentado en el informe tecnico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer denso, y se especializa en traduccion mediante un proceso de entrenamiento en tres fases descrito en el informe tecnico. La primera fase es un mid-training multilingue compartido que combina replay de texto general, texto monolingue, traducciones paralelas ordinarias y grupos multilingues organizados por pivote. La etapa constante usa datos generales, paralelos y monolingues en proporcion 1:1:1, mientras que la etapa de decay usa datos generales, core-pivot y full-pivot en proporcion 1:4:2. La receta compartida totaliza 167.770 millones de tokens.

La segunda fase consiste en SFT y RL especializados para traduccion general, seguimiento de instrucciones y traduccion de memes. El RL de traduccion general combina XCOMET-XXL con juicios de validez linguistica y adecuacion; el RL de instrucciones usa Rubric-as-Reward con comprobaciones duras y restricciones graduadas; RIVAL aporta supervision adaptativa de jueces. La tercera fase integra los especialistas mediante interpolacion de parametros y destilacion on-policy multi-profesor (MOPD) para abordar las tareas que quedan debiles tras la fusion. Los modelos 2B y 9B combinan los especialistas general, de instrucciones y de memes con pesos 0,8 / 0,1 / 0,1, seguido de MOPD selectivo.

## Capacidades

- Traduccion de texto multilingue en 150 idiomas: frases, articulos, subtitulos y otros formatos.
- Traduccion de imagenes de extremo a extremo (image-to-text) sin OCR externo, mediante codificadores visuales complementarios `mmproj`.
- Seguimiento de instrucciones de traduccion con restricciones duras: glosarios estrictos, preservacion de estructuras JSON, CSV y markdown, bloques de codigo y placeholders como `{variable}` o `[123456]`.
- Restricciones blandas: adaptacion de tono (formal, informal, estilo redes sociales o meme) y desambiguacion por dominio y contexto (por ejemplo, sentido industrial frente a botanico de un termino).
- Traduccion social y cultural: interpretacion de alias de comunidad, ortografia ludica, memes y expresiones no literales atendiendo a su significado pretendido.
- Capacidades de seguimiento de instrucciones evaluadas de forma independiente de la calidad de traduccion (instTrans IFscore, IFMTBench IFscore).

## Casos de uso

- Localizacion de productos digitales: el modelo puede traducir cadenas de interfaz preservando placeholders y estructuras JSON o markdown, lo que permite integrarlo en pipelines de internacionalizacion sin romper el formato de los archivos de recursos.
- Traduccion de documentacion tecnica: con restricciones de glosario estricto, garantiza coherencia terminologica en manuales y articulos, manteniendo bloques de codigo y variables intactos.
- Subtitulado y doblaje: traduce subtitulos con control de longitud de salida y adaptacion de tono, adecuado para contenido audiovisual en 150 idiomas.
- Traduccion de imagenes en aplicaciones moviles: al soportar image-to-text sin OCR externo, puede integrarse en apps de traduccion de carteles, menus o capturas de pantalla.
- Moderacion y traduccion de contenido generado por usuarios: su capacidad para interpretar memes, alias y expresiones no literales lo hace util en plataformas sociales que necesitan entender y traducir jerga de comunidad.
- Atencion al cliente multilingue: puede traducir conversaciones con contexto y adaptar el tono al registro adecuado, aunque la longitud de contexto no esta documentada.
- Traduccion de datos estructurados: preserva CSV, JSON y markdown, lo que facilita la traduccion de bases de datos y hojas de calculo sin postprocesado.

## Benchmarks y rendimiento

| Modelo | FLORES COMET-22 | WMT24++ COMET-22 | WMT26 Judge (0-100) | instTrans Quality | instTrans IFscore | IFMTBench XCOMET-XXL | IFMTBench IFscore | Vertical mean | MEME |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Index-Translate-35B-A3B (preview) | 0,8794 | 0,8586 | 76,76 | 0,6901 | 0,8336 | 0,7926 | 0,8991 | 0,8438 | 0,7405 |
| Index-Translate-9B | 0,8789 | 0,8601 | 75,35 | 0,6771 | 0,8209 | 0,7957 | 0,8760 | 0,8451 | 0,7387 |
| **Index-Translate-2B** | 0,8655 | 0,8489 | 60,26 | 0,5391 | 0,7569 | 0,7712 | 0,7584 | 0,8377 | 0,6443 |
| Hy-MT2-1.8B | 0,8522 | 0,8401 | 49,35 | 0,3181 | 0,4932 | 0,7493 | 0,7161 | 0,8314 | 0,3643 |
| Hy-MT2-7B | 0,8747 | 0,8593 | 60,51 | 0,5143 | 0,6079 | 0,8049 | 0,8741 | 0,8335 | 0,5139 |
| Hy-MT2-30B-A3B | 0,8787 | 0,8624 | 66,81 | 0,5725 | 0,6415 | 0,8177 | 0,9029 | 0,8459 | 0,5812 |
| TranslateGemma-12B | 0,8732 | 0,8524 | 71,19 | 0,4515 | 0,3068 | 0,8023 | 0,2892 | 0,8347 | 0,4281 |

Las metricas instTrans quality e IFscore miden calidad de traduccion y adherencia a instrucciones por separado. IFMTBench reporta XCOMET-XXL con referencia y adherencia a instrucciones. Vertical es la media equiponderada de cinco puntuaciones de dominio. En traduccion de instrucciones de bajos recursos, el modelo obtiene 0,3050 de calidad y 0,6586 de IFscore, con un 3,97 % de salidas fuera de objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2.274 millones de parametros, en FP16 requiere aproximadamente 4,5 GB de pesos; en cuantizacion de 8 bits, unos 2,3 GB; en 4 bits, unos 1,2 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabe en GPUs de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4090 y superiores en FP16.
- Cabe en GPU de consumo: si, segun el tamano del modelo, aunque no hay confirmacion oficial.
- Opciones de despliegue: no disponibles en la informacion proporcionada. El formato safetensors sugiere uso con frameworks como Transformers, vLLM o TGI, pero no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FLORES COMET-22 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Index-Translate-2B | 2,27B | no disponible | 0,8655 | Apache 2.0 | Hugging Face |
| Hy-MT2-1.8B | 1,8B | no disponible | 0,8522 | no disponible | no disponible |
| Hy-MT2-7B | 7B | no disponible | 0,8747 | no disponible | no disponible |
| TranslateGemma-12B | 12B | no disponible | 0,8732 | no disponible | no disponible |

Index-Translate-2B supera a Hy-MT2-1.8B en todas las metricas principales y se acerca a Hy-MT2-7B en WMT26 Judge (60,26 frente a 60,51) con menos de un tercio de los parametros. Frente a TranslateGemma-12B, queda por debajo en WMT26 Judge (60,26 frente a 71,19) pero lo supera ampliamente en instTrans IFscore (0,7569 frente a 0,3068) y en IFMTBench IFscore (0,7584 frente a 0,2892).

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo, es susceptible de producir traducciones inexactas, especialmente en idiomas de bajos recursos.
- En traduccion de instrucciones de bajos recursos, el modelo presenta un 3,97 % de salidas fuera de objetivo, lo que requiere validacion en produccion.
- La longitud de contexto no esta documentada, lo que limita la planificacion de casos de uso con documentos largos.
- Los tipos de cuantizacion soportados no estan documentados.
- La lista completa de idiomas solo esta en el informe tecnico, no en la model card.
- Aunque la licencia es Apache 2.0, conviene verificar los terminos de los datos de entrenamiento y de los componentes visuales `mmproj` para uso comercial.
- Las capacidades de voz y documentos largos pertenecen a otros modelos de la familia con interfaces y cobertura linguistica propias, no a este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/uazsu/Index-Translate-2B
- Demo online: https://index-translate.bilibili.com/
- GitHub: https://github.com/bilibili/Index-Translate
- Informe tecnico: https://arxiv.org/abs/2609.40181
- Coleccion en Hugging Face: https://huggingface.co/collections/IndexTeam/index-translate
- Coleccion en ModelScope: https://www.modelscope.cn/collections/IndexTeam/Index-Translate
