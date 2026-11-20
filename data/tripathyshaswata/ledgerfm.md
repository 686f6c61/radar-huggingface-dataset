# tripathyShaswata/LedgerFM

## Resumen

LedgerFM v0.1 es un modelo fundacional abierto para secuencias de transacciones financieras, orientado a deteccion de fraude y prevencion de blanqueo de capitales (AML). Lo desarrolla el usuario independiente `tripathyShaswata` y se publica bajo licencia Apache-2.0. Resuelve un hueco concreto: las grandes companias de pagos (Stripe, Visa, Mastercard, Feedzai, Revolut) operan modelos fundacionales de transacciones internamente, pero ninguno es publico. LedgerFM es una alternativa pequena y abierta que cualquier institucion puede auditar, ajustar y desplegar.

Tecnicamente es un transformer causal de 26,6 millones de parametros que procesa el historial de transacciones de una cuenta y devuelve un embedding de 256 dimensiones por transaccion. No es un modelo generativo de texto: su `pipeline_tag` es `feature-extraction` y su uso previsto es producir caracteristicas que se incorporan a un pipeline de deteccion supervisado (tipicamente un XGBoost ya existente) o servir de base para fine-tuning.

Su relevancia actual reside en el enfasis del autor en la honestidad metodologica: separacion temporal 60/20/20, eleccion de hiperparametros solo en validacion, evaluacion unica en test y publicacion de resultados negativos (por ejemplo, que con pocas etiquetas o historiales cortos XGBoost es igual o mejor). Es un modelo de 0,1 GB entrenado exclusivamente con datos sinteticos con licencia permisiva, lo que simplifica su adopcion en entornos regulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) |
| Parametros totales | 26.576.121 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del historial de la cuenta; no se publica un limite explicito) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo no linguistico; opera sobre campos tabulares y categoricos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (106 MB), libreria PyTorch |

## Arquitectura y entrenamiento

LedgerFM es un transformer causal de tipo decoder-only que consume una secuencia de transacciones ordenada temporalmente por cuenta. Cada transaccion se tokeniza a partir de campos tabulares: identificador de cuenta, contraparte, importe y divisa (convertidos a USD con una escala fija), y campos opcionales como categoria, canal, ubicacion, instrumento, banco origen/destino y errores. El tokenizador usa transformaciones fijas y hashing md5, sin estadisticas del dataset, de modo que una institucion nueva puede usarlo sin reajustar el vocabulario. La salida es un embedding de 256 dimensiones por transaccion (`emb0..emb255`). El modelo solo codifica el historial del emisor y estadisticos resumen del receptor; una variante de dos lados fue probada y descartada por no mejorar la validacion.

El entrenamiento se realizo exclusivamente sobre datos sinteticos con licencia permisiva, principalmente el dataset IBM Transactions for Anti-Money-Laundering (AMLworld) y otros simuladores (IBM card/TabFormer, Sparkov). No se documenta el numero exacto de tokens ni la composicion detallada del corpus, ni si hubo RLHF/DPO (no aplicable a un modelo de embeddings). El autor reporta entrenamiento autoregresivo causal sobre secuencias de transacciones; no se detallan innovaciones como decodificacion especulativa o attention linear.

## Capacidades

- Extraccion de caracteristicas: genera un embedding de 256 dimensiones por transaccion a partir del historial de la cuenta.
- Modelado de secuencias temporales de transacciones con contexto de historial largo por cuenta.
- Deteccion de fraude y patrones de blanqueo de capitales (AML) tras fine-tuning supervisado.
- Integracion con modelos tabulares: sus embeddings se anaden como features a un XGBoost existente.
- Fine-tuning sobre datos propios de una institucion.
- Tokenizacion sin reajuste: transformaciones fijas y hashing md5 permiten usar el modelo con nuevas instituciones sin recalcular estadisticas.
- Manejo de campos opcionales nulos y de transacciones multi-divisa (campos `amount_recv`, `currency_recv`).
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto: es un extractor de features, no un LLM conversacional.

## Casos de uso

- Deteccion de fraude en pagos con tarjeta: fine-tuning de LedgerFM sobre el historial de cada tarjeta y combinacion con un XGBoost; en el benchmark Sparkov alcanza PR-AUC de 0,991 frente a 0,946 de XGBoost solo.
- Monitorizacion AML en banca corresponsal: usar los embeddings como features en un modelo supervisado de alertas sobre transacciones entre bancos, aprovechando los campos `src_bank` y `dst_bank`.
- Enriquecimiento de un pipeline XGBoost existente: anadir las 256 dimensiones de LedgerFM a las features causales ya calculadas; el blend elegido en validacion igualo o supero al mejor modelo individual en todos los datasets evaluados.
- Escenarios con escasez de etiquetas en fraude de tarjeta: con solo el 1% de etiquetas en Sparkov, LedgerFM obtiene 0,787 frente a 0,621 de XGBoost, util cuando el etiquetado es costoso.
- Transferencia entre instituciones: el modelo preentrenado sin ver un dataset concreto mantiene rendimiento (0,978 en Sparkov sin haber sido entrenado con el), lo que permite arrancar en un entorno nuevo con datos sinteticos y ajustar despues.
- Investigacion y reproduccion academica: al ser Apache-2.0 y entrenarse solo con datos sinteticos, sirve como baseline abierto para comparar arquitecturas de modelos fundacionales de transacciones.
- Prototipado rapido en entornos regulados: al no depender de datos reales de clientes para el preentrenamiento, simplifica la revision de cumplimiento antes de un piloto.

## Benchmarks y rendimiento

Resultados de PR-AUC con split temporal 60/20/20. Positivos entre el 0,05% y el 1% de las filas.

Test fresco (IBM AML HI-Large, 2022-08-01 a 08-11, 22,6M transacciones, 3.095 casos de blanqueo en test):

| Modelo (etiquetas completas) | Validacion | Test |
|---|---|---|
| XGBoost (29 features causales) | 0,268 | 0,289 |
| LedgerFM sin preentrenamiento | 0,172 | 0,202 |
| LedgerFM preentrenado solo con periodo de train (`fm_all`, research) | 0,291 | 0,305 |
| LedgerFM v0.1 (pesos publicados), fine-tuned | 0,300 | 0,332 |
| LedgerFM v0.1 + blend con XGBoost (w_fm = 0,9) | 0,315 | 0,338 |

Con el 10% de las etiquetas en el test fresco, XGBoost gana: 0,246 frente a 0,199.

Estudio comparativo (pesos de investigacion `fm_all`, PR-AUC en test):

| Dataset | Historial | LedgerFM fine-tuned | Sin preentrenamiento | XGBoost | XGBoost + emb. LedgerFM |
|---|---|---|---|---|---|
| Sparkov (fraude de tarjeta) | largo | 0,991 | 0,942 | 0,946 | 0,956 |
| IBM AML HI-Medium | largo | 0,764 | 0,672 | 0,726 | 0,747 |
| IBM AML LI-Medium | largo | 0,369 | 0,214 | 0,357 | 0,346 |
| IBM AML HI-Small (3 semillas) | largo | 0,696 ± 0,005 | 0,479 | 0,686 ± 0,004 | 0,707 ± 0,006 |
| IBM AML LI-Small (3 semillas) | largo | 0,313 ± 0,010 | 0,070 | 0,303 ± 0,011 | 0,310 ± 0,005 |
| IEEE-CIS (real, solo evaluacion) | corto | 0,152 | 0,118 | 0,492 | 0,487 |
| PaySim (solo evaluacion, sin campos de saldo) | corto | 0,509 | 0,415 | 0,460 | 0,406 |
| IBM card (datos TabFormer) | largo | 0,191 | 0,032 | 0,026 | 0,036 |

Pocas etiquetas en Sparkov (test): con el 10% de etiquetas, LedgerFM 0,963 frente a 0,885 de XGBoost; con el 1%, 0,787 frente a 0,621. El blend elegido en validacion fue al menos tan bueno como el mejor modelo individual en todos los datasets (IEEE-CIS: 0,626 frente a 0,604 de XGBoost y 0,269 de LedgerFM; IBM AML HI-Small: 0,626 frente a 0,597 y 0,595).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint safetensors ocupa 106 MB y el modelo tiene 26,6M de parametros. En fp32 ronda los 0,1 GB de pesos; en fp16 aproximadamente 0,05 GB. La memoria dominante sera la del DataFrame de transacciones y los lotes de secuencias.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090); tambien funciona en CPU para lotes pequenos. Para volumenes de millones de transacciones conviene una A100 o H100 para procesar lotes grandes en paralelo.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: PyTorch nativo mediante el paquete `ledgerfm` (`from ledgerfm.hub import load, embed`); no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama (no aplicables a un extractor de features tabular).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PR-AUC (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LedgerFM v0.1 | 26,6M | no disponible | 0,332 (IBM AML HI-Large test fresco) | Apache-2.0 | Abierto en Hugging Face |
| XGBoost (29 features causales) | no aplica | no aplica | 0,289 (mismo test) | BSD/Apache segun implementacion | Ampliamente disponible |
| Modelos fundacionales de transacciones de Stripe, Visa, Mastercard, Feedzai, Revolut | no disponible | no disponible | no disponible | Propietaria | Cerrados, no accesibles |

No se conocen otros modelos fundacionales de transacciones abiertos con los que comparar directamente; los equivalentes comerciales no publican arquitectura, parametros ni resultados.

## Limitaciones y advertencias

- Datos mayoritariamente sinteticos: el entrenamiento y la mayor parte de la evaluacion usan simuladores (IBM AMLworld, IBM card, Sparkov). El unico dataset real (IEEE-CIS) tiene historiales cortos y ahi LedgerFM solo obtiene 0,152 frente a 0,492 de XGBoost. Validar siempre con datos propios antes de confiar en el modelo.
- Historiales cortos: si la mayoria de cuentas tienen pocas transacciones, conviene usar XGBoost o el blend, que selecciona la mejor opcion en validacion.
- Pocas etiquetas: salvo en Sparkov, la ventaja con bajo numero de etiquetas no se mantuvo; en el test fresco con el 10% de etiquetas gano XGBoost.
- Deriva (drift): en los datos IBM card, el 88% del fraude del periodo de test es fraude de tarjeta con chip, ausente en los anos de entrenamiento; todos los modelos colapsan en test (LedgerFM 0,191, XGBoost 0,026, con validacion en torno a 0,9).
- Solo historial del emisor: el modelo ve el pasado del emisor y estadisticos resumen del receptor; una variante de dos lados no mejoro la validacion y no forma parte de v0.1.
- PaySim con sus campos de saldo brutos es trivialmente separable (XGBoost 1,000); los resultados reportados eliminan esos campos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero los embeddings pueden producir falsos positivos y falsos negativos; el modelo no explica sus predicciones por si mismo.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no se documentan restricciones adicionales, pero el uso en produccion financiera exige revision de cumplimiento propia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema minimo, sin validacion independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tripathyShaswata/LedgerFM
- Dataset de entrenamiento (IBM Transactions for AML): https://huggingface.co/datasets/ealtman2019/ibm-transactions-for-anti-money-laundering-aml
- No se han proporcionado enlaces adicionales a papers, blogs, repositorios o demos en la informacion disponible.
