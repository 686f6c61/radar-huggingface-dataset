# yamero999/mudraforge-stage1a-parser

## Resumen

MudraForge Stage 1A Statutory Parser es un paquete modular de extraccion de entidades sobre texto legal estatutario, publicado por el usuario yamero999 en Hugging Face bajo licencia Apache 2.0. No es un unico modelo transformer monolitico, sino un conjunto de tres micro-especialistas neuronales (Micro-1, Micro-2 y Micro-3) coordinados por un arbitro de consenso determinista y una cola diferida de sub-spans. El paquete esta orientado a dominios de finanzas corporativas, insolvencia, banca, contratos comerciales y derecho fiscal, y trabaja exclusivamente sobre texto en ingles.

El objetivo del sistema es resolver la extraccion de hojas estatutarias cerradas (importes monetarios, tipos de interes, fechas, duraciones, conteos, referencias cruzadas legislativas, terminos definidos y operadores deonticos como `shall`, `may`, `must`) sin recurrir a expresiones regulares ni a diccionarios de vocabulario abierto. Cada micro-especialista es una red neuronal de muy baja parametrizacion (entre 230K y 304K parametros, con un encoder comun de 124K), lo que da un tamano total del paquete de aproximadamente 6,5 MB.

La relevancia practica del modelo radica en su planteamiento de despliegue ligero: segun la model card, el pipeline completo procesa una provision estatutaria en aproximadamente 338 ms sobre una GPU de portatil (RTX 3050) y 423 ms sobre CPU, con un rendimiento declarado de 99,18 % de F1 exacto sobre un conjunto de provisiones no vistas. El modelo esta etiquetado como `token-classification` en el Hub, aunque funcionalmente opera como un pipeline de extraccion estructurada con dos capas de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de tres micro-redes neuronales (encoder comun de 124K parametros) coordinadas por un arbitro de consenso determinista; el autor la describe como "pure-17D neural micro-specialists" |
| Parametros totales | Micro-1: 283K; Micro-2: 230K; Micro-3: 304K (paquete completo ~6,5 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El sistema se compone de tres especialistas neuronales independientes que operan sobre un encoder compartido de 124K parametros. Micro-1 se encarga de literales de cantidad, techos y suelos monetarios, tipos fijos y flotantes, fechas de calendario, duraciones, conteos cardinales y terminos definidos estatutarios (clases `MONEY`, `RATE`, `DATE`, `DURATION`, `COUNT`, `DEFINED_TERM`). Micro-2 resuelve referencias cruzadas legislativas, citas multi-nivel y anclas de sub-clausula (clase `XREF`). Micro-3 detecta operadores legales ejecutables: modales deonticos (`shall`, `may`, `must`), comparadores de umbral (`within`, `after`, `more than`), anulaciones (`unless`, `provided that`) y conectores logicos, mapeados a 18 opcodes estatutarios canonicos.

El arbitraje entre las tres salidas se realiza mediante un mecanismo determinista de consenso que combina las propuestas de cada especialista en una unica capa de hojas reclamadas (`leaves`). Los sub-spans relacionales que no constituyen hojas cerradas se derivan a una cola diferida (`sub_spans`) con estado `PENDING_CLAIM`, etiquetados con opcodes como `COND_GUARD` y `NEG_LOGIC`, y pensados para una compilacion posterior en AST de condiciones. El autor declara explicitamente cero expresiones regulares y cero diccionarios de vocabulario abierto en el diseno. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Extraccion de entidades estatutarias cerradas: importes monetarios (`MONEY`), tipos de interes (`RATE`), fechas (`DATE`), duraciones (`DURATION`), conteos (`COUNT`) y terminos definidos (`DEFINED_TERM`).
- Resolucion de referencias cruzadas legislativas multi-nivel y anclas de sub-clausula (`XREF`).
- Deteccion de operadores deonticos y comparadores de umbral (`shall`, `may`, `must`, `within`, `after`, `more than`).
- Deteccion de anulaciones y excepciones (`unless`, `provided that`).
- Clasificacion de conectores logicos y funtores de condicion (`or`, `and`, `if`, `where`, `from`, `no`) con opcodes `COND_GUARD` y `NEG_LOGIC`.
- Salida estructurada en dos capas: hojas reclamadas (`leaves`) y pool diferido de sub-spans (`sub_spans`).
- Procesamiento exclusivamente en ingles.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Extraccion de obligaciones financieras en contratos corporativos: el pipeline identifica importes, tipos y plazos en clausulas de pago y los devuelve como hojas etiquetadas con codigo canonico, lo que permite alimentar un motor de cumplimiento o un sistema de contabilidad contractual.
- Analisis de clausulas de insolvencia y banca: la deteccion de umbrales (`not less than`, `within`) y anulaciones (`unless`) permite aislar condiciones de activacion de garantias o de incumplimiento en provisiones estatutarias.
- Construccion de grafos de referencias legislativas: Micro-2 resuelve citas multi-nivel entre secciones y sub-clausulas, lo que sirve para generar un grafo de dependencias normativas o para enlazar provisiones con su articulado de origen.
- Preprocesado para compilacion de AST legal: los sub-spans en `PENDING_CLAIM` con opcodes `COND_GUARD` y `NEG_LOGIC` estan pensados para que un compilador posterior construya arboles de condiciones ejecutables a partir de la clausula original.
- Enriquecimiento de repositorios documentales legales: el pipeline puede ejecutarse sobre lotes de provisiones para poblar un indice de entidades (importes, fechas, tipos, referencias) que facilite la busqueda y el filtrado semantico.
- Despliegue en entornos con recursos limitados: con un paquete de ~6,5 MB y latencias de ~338 ms por provision en una RTX 3050 y ~423 ms en CPU, es viable ejecutarlo en portatiles o en contenedores sin GPU dedicada para tareas de extraccion por lotes.
- Auditoria de cobertura normativa: la metrica de recall del 100 % declarada por el autor sugiere su uso para verificar que ninguna entidad estatutaria de una provision queda sin capturar en procesos de revision documental.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre provisiones estatutarias corporativas y comerciales no vistas, evaluados de extremo a extremo con `MudraForgeModularPipeline`:

| Metrica | Resultado | Desglose |
|---|---|---|
| F1 exacto | 99,18 % | IoU = 1,0, coincidencia exacta de etiqueta |
| Recall | 100,00 % | 303 / 303 capturados (0 hojas gold perdidas) |
| Precision | 98,38 % | 303 TP, 5 FP (el autor indica que los 5 FP son omisiones genuinas del gold standard) |
| F1 relajado | 99,18 % | IoU >= 0,50 |

Rendimiento por clase:

| Clase | Gold | TP | FP | FN | Precision | Recall | F1 exacto | Especialista |
|---|---|---|---|---|---|---|---|---|
| MONEY | 12 | 12 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | Micro-1 |
| RATE | 11 | 11 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | Micro-1 |
| DATE | 9 | 9 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | Micro-1 |
| DURATION | 25 | 25 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | Micro-1 |
| COUNT | 12 | 12 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | Micro-1 |
| DEFINED_TERM | 10 | 10 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | Micro-1 |
| XREF | 50 | 50 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | Micro-2 |
| OP | 174 | 174 | 5 | 0 | 97,21 % | 100,00 % | 98,58 % | Micro-3 |

Latencia declarada:

| Entorno | Medicion | Valor |
|---|---|---|
| RTX 3050 Laptop (CUDA) | Inferencia neuronal pura (Micro-1 + Micro-2 + Micro-3) | 124,0 ms / provision |
| RTX 3050 Laptop (CUDA) | Pipeline completo extremo a extremo | 338,4 ms / provision (~3 provisiones/s) |
| CPU Intel Core i5 (x86_64) | Pipeline completo extremo a extremo | 422,8 ms / provision (~2,4 provisiones/s) |

No se aportan comparaciones con otros modelos en la informacion disponible; los datos anteriores son los unicos publicados y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; dado el tamano del paquete (~6,5 MB de pesos en tres ficheros `.pt`), la huella en memoria es minima y no deberia superar unos pocos cientos de MB incluyendo tokenizador y tensores intermedios.
- GPU recomendadas: el autor reporta mediciones sobre una NVIDIA GeForce RTX 3050 Laptop, por lo que cualquier GPU consumer con CUDA es suficiente. No se documentan requisitos para A100, H100 ni otras GPU de centro de datos.
- Cabe en GPU consumer: si, segun las mediciones del autor sobre RTX 3050 Laptop.
- Opciones de despliegue: el paquete se distribuye como modulo Python (`modular_pipeline`) con pesos PyTorch (`.pt`); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~338,4 ms por provision en RTX 3050 Laptop y ~422,8 ms por provision en CPU Intel Core i5, equivalentes a ~3 y ~2,4 provisiones por segundo respectivamente.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria (por ejemplo, modelos NER legales genericos o parsers estatutarios especializados). Los unicos datos disponibles son los declarados por el propio autor para este paquete.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MudraForge Stage 1A Statutory Parser | ~817K en total (3 especialistas) | No disponible | Apache 2.0 | `.pt` (PyTorch) | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se documenta cobertura multilingue.
- El ambito es exclusivamente estatutario (finanzas corporativas, insolvencia, banca, contratos comerciales y fiscalidad); no es un modelo de proposito general y no se documentan capacidades de generacion, razonamiento o codigo.
- Los benchmarks publicados (99,18 % de F1 exacto, 100 % de recall) proceden del propio autor y se han evaluado sobre un conjunto de 303 hojas gold; no se ha verificado de forma independiente y el tamano muestral es reducido.
- El autor reconoce 5 falsos positivos en la clase `OP` que atribuye a omisiones del gold standard; esta justificacion no es verificable de forma externa.
- No se documentan sesgos conocidos, riesgos de alucinacion ni comportamiento fuera de dominio; al ser un extractor de entidades y no un generador, el riesgo de alucinacion textual es bajo, pero la asignacion incorrecta de etiquetas o la omision de entidades sigue siendo posible.
- No se especifican la longitud de contexto soportada, los tipos de cuantizacion ni el proceso de entrenamiento, lo que limita la reproducibilidad.
- El paquete se distribuye como modulo Python propietario (`modular_pipeline`) con pesos `.pt`; no hay soporte documentado para formatos estandar como safetensors o GGUF, lo que puede complicar la integracion en stacks habituales de inferencia.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantias de exactitud legal; cualquier uso en produccion juridica deberia acompanarse de validacion humana.
- El repositorio no registra descargas ni likes en el momento de la consulta y el autor es un usuario individual, no una organizacion con historial verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yamero999/mudraforge-stage1a-parser
