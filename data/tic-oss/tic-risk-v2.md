# tic-oss/tic-risk-v2

## Resumen

TIC Risk Open es un modelo de 232 millones de parametros desarrollado por la organizacion tic-oss (The Intelligence Company) que predice el riesgo de quiebra de empresas limitadas suecas. A diferencia de los grandes modelos de lenguaje, se trata de un modelo de clasificacion tabular sobre series temporales de eventos empresariales: cada historia de empresa se lee como una secuencia de sucesos (informes anuales, tasas por presentacion tardia, registros fiscales, deudas de ejecucion, cambios en el consejo, empresas relacionadas) y sobre ella se generan probabilidades calibradas de quiebra a 12 y 24 meses, junto con otras cuatro predicciones de riesgo financiero.

El modelo es relevante porque demuestra como aplicar arquitecturas de tipo transformer hibrido (con capas recurrentes gated delta-net y atencion completa) a datos tabulares y de eventos, un campo dominado hasta ahora por enfoques como gradient boosting o modelos in-context como TabICL. Fue entrenado exclusivamente con registros publicos de todas las empresas limitadas de Suecia, sin datos personales, y sus probabilidades vienen calibradas con intervalos de prediccion del 90%.

Se distribuye en safetensors (0,9 GB) bajo doble licencia MIT o Apache-2.0, incluye una CLI (`tic-risk`) que funciona sin conexion y solo en CPU, y esta pensado como punto de partida para entrenar adaptadores LoRA con datos propios o replicar el enfoque en otros paises.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 18 capas, 3 de cada 4 son gated delta-net (recurrentes) y cada cuarta capa es de atencion completa; tamano oculto 768 |
| Parametros totales | 232M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de eventos por empresa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Sueco (sv); los codigos de eventos parten de embeddings de texto de su descripcion |
| Licencia | Doble licencia MIT o Apache-2.0, a eleccion del usuario |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer hibrido de 18 capas con tamano oculto de 768. Tres de cada cuatro capas son gated delta-net, un tipo de capa recurrente que procesa la secuencia de eventos de forma eficiente, y cada cuarta capa es de atencion completa, lo que permite capturar dependencias a largo plazo en la historia de la empresa. Cada evento se convierte en un token: los codigos parten de un embedding de texto de la descripcion del codigo, los importes se escalan logaritmicamente y cada token incorpora su fecha. El modelo solo ve eventos conocidos en la fecha en que puntua la empresa, evitando fugas de informacion futura.

El entrenamiento uso registros publicos de todas las empresas limitadas de Suecia, procedentes del registro mercantil, la agencia tributaria, la autoridad de ejecucion y la oficina de estadistica, sin ningun dato personal: cuando una persona ocupa un cargo en una empresa, el modelo solo ve que el cargo existe. Ademas de la empresa evaluada, incorpora empresas relacionadas (empresas propietarias y auditoras siempre, mas hasta 24 relacionadas adicionales) y 26 series macroeconomicas nacionales (desempleo, PIB, precios, precio de la vivienda, tipos de interes). Las probabilidades de salida se calibran sobre empresas excluidas del entrenamiento, y los intervalos de prediccion se derivan de los errores sobre esas mismas empresas.

## Capacidades

- Prediccion de quiebra a 12 y 24 meses (`bankruptcy_12m`, `bankruptcy_24m`) con probabilidad calibrada e intervalo de prediccion del 90%.
- Prediccion de deuda de ejecucion nueva o aumentada a 12 meses (`enforcement_debt_12m`).
- Prediccion de revocacion de registro fiscal (FK) por mala conducta a 12 meses (`fskatt_revoked_12m`).
- Prediccion de informe anual fuera de plazo a 12 meses (`report_overdue_12m`).
- Clase de riesgo (1 = riesgo mas alto, 5 = mas bajo) y puntuacion de 0 a 100 (100 = menor riesgo) para la prediccion de quiebra a 12 meses.
- Probabilidades mes a mes para cada uno de los 24 meses siguientes.
- Uso offline en CPU mediante la CLI `tic-risk`, con verificacion de integridad por SHA-256.
- Extensibilidad mediante entrenamiento de adaptadores LoRA con datos propios, o replicacion del metodo para otros paises.

## Casos de uso

- Evaluacion de riesgo crediticio de pymes suecas: un prestamista puede puntuar carteras de empresas limitadas y usar la clase de riesgo 1-5 y la puntuacion 0-100 como insumo para decisiones de concesion y precios de credito.
- Monitorizacion temprana de carteras: la prediccion de deuda de ejecucion a 12 meses permite detectar deterioro financiero antes de que aparezca en los informes anuales, dado que el modelo lee eventos en tiempo casi real (tasas, deudas de ejecucion, ordenes de pago).
- Cumplimiento y gestion de proveedores: la prediccion de revocacion de registro fiscal por mala conducta ayuda a filtrar proveedores con riesgo de sancion fiscal antes de firmar contratos.
- Auditoria y servicios profesionales: la prediccion de informe anual fuera de plazo (`report_overdue_12m`) senala empresas con probabilidad de incumplir obligaciones contables, util para priorizar clientes de riesgo.
- Investigacion academica en riesgo de quiebra: el paper publicado y la comparacion con TabICL la convierten en una base reproducible para estudiar modelos de eventos sobre datos tabulares frente a metodos in-context.
- Plantilla para replicacion internacional: el README describe como entrenar un modelo analogo para otro pais a partir de sus registros de eventos empresariales, y permite ajustar un LoRA con datos propios y compararlo con el modelo base.
- Analisis offline y con requisitos de privacidad: al ejecutarse en CPU sin conexion y sin datos personales, es adecuado para entornos regulados donde no se puede enviar informacion financiera a servicios externos.

## Benchmarks y rendimiento

Evaluado sobre un conjunto de test del 10% de las empresas (excluido de todo el entrenamiento), puntuado en 12 fechas mensuales:

| Prediccion | Tasa positiva | AUC | PR-AUC | Capturado en el 10% mas riesgoso | Error de calibracion |
|---|---|---|---|---|---|
| Quiebra, 12 meses | 0,91% | 0,924 | 0,254 | 76% | 0,0009 |
| Quiebra, 24 meses | 1,85% | 0,890 | 0,201 | 64% | 0,0007 |
| Deuda de ejecucion, 12 meses | 5,22% | 0,891 | 0,508 | 64% | 0,0051 |
| Registro fiscal revocado, 12 meses | 0,65% | 0,951 | 0,195 | 87% | 0,0017 |
| Informe anual fuera de plazo, 12 meses | 3,83% | 0,894 | 0,396 | 64% | 0,0030 |

Comparacion con TabICL sobre 605 caracteristicas construidas a partir de los mismos datos, en el mismo conjunto de test:

| Prediccion | AUC | AUC TabICL | PR-AUC | PR-AUC TabICL |
|---|---|---|---|---|
| Quiebra, 12 meses | 0,924 | 0,913 | 0,254 | 0,256 |
| Quiebra, 24 meses | 0,890 | 0,853 | 0,201 | 0,149 |
| Deuda de ejecucion, 12 meses | 0,891 | 0,884 | 0,508 | 0,520 |
| Registro fiscal revocado, 12 meses | 0,951 | 0,952 | 0,195 | 0,243 |
| Informe anual fuera de plazo, 12 meses | 0,8944 | 0,8936 | 0,396 | 0,400 |

TIC Risk obtiene mayor AUC en cuatro de las cinco predicciones; TabICL logra mayor PR-AUC en cuatro, en parte porque la calibracion asigna la misma probabilidad a grupos de empresas similares, lo que penaliza mas el PR-AUC que el AUC.

## Requisitos de hardware

- VRAM estimada: no aplicable; el modelo esta disenado para ejecutarse en CPU, no requiere GPU para inferencia.
- GPU recomendadas: no disponibles; no se necesita GPU segun la documentacion.
- Consumer GPU: no es necesario; el tamano del repositorio es de 0,9 GB y la CLI funciona offline en CPU.
- Despliegue: CLI oficial `tic-risk` (binario firmado para Windows y binario estatico para Linux, con verificacion SHA-256). Tambien se puede descargar con `hf download tic-oss/tic-risk-v2 --local-dir tic-risk-model`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Caracteristica | TIC Risk Open | TabICL (referencia del paper) |
|---|---|---|
| Parametros | 232M | no disponible |
| Tipo | Transformer hibrido (gated delta-net + atencion) sobre eventos | Modelo in-context para clasificacion tabular |
| Entrada | Secuencia de eventos empresariales con fechas e importes | 605 caracteristicas tabulares derivadas de los mismos datos |
| AUC quiebra 12m | 0,924 | 0,913 |
| AUC quiebra 24m | 0,890 | 0,853 |
| Salida | Probabilidades calibradas con intervalos de prediccion del 90% | no disponible |
| Licencia | MIT o Apache-2.0 | no disponible |
| Ejecucion | Offline en CPU via CLI | no disponible |

No hay otras alternativas comparables publicadas en la informacion disponible.

## Limitaciones y advertencias

- Solo cubre empresas limitadas suecas; otros tipos de empresa y otros paises no estan cubiertos, aunque el metodo de entrenamiento puede usarse como referencia para construir modelos analogos.
- Las probabilidades calibradas vienen en pasos discretos, por lo que empresas similares pueden recibir exactamente la misma probabilidad.
- El modelo no usa datos personales: cuando una persona ocupa un cargo, solo ve la existencia del cargo, lo que limita la senal que podrian aportar historiales individuales.
- En eventos raros (quiebra a 12 meses: tasa positiva del 0,91%), el PR-AUC es bajo en terminos absolutos (0,254); las probabilidades deben interpretarse con cuidado y no como veredictos individuales definitivos.
- Al tratarse de un modelo entrenado con datos publicos suecos, su rendimiento puede degradarse si las practicas de registro o la economia cambian, o si se aplica fuera de su dominio de entrenamiento.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni instrucciones; su interfaz es la CLI y ficheros de eventos estructurados.
- El uso comercial esta permitido bajo la doble licencia MIT/Apache-2.0, sin restricciones adicionales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tic-oss/tic-risk-v2
- Repositorio con CLI y paper: https://github.com/the-intelligence-company/tic-risk
- Paper (PDF): https://github.com/the-intelligence-company/tic-risk/blob/main/paper/tic-risk-v2.pdf
- Licencia: https://huggingface.co/tic-oss/tic-risk-v2/blob/main/LICENSE
