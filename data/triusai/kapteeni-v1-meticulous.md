# TriusAI/kapteeni-v1-meticulous

## Resumen

Kapteeni v1 (variante `kapteeni-v1-meticulous`) es un modelo de decisión, no de generación de texto, desarrollado por TriusAI. Recibe un estado en lenguaje natural junto con un conjunto de preguntas tipadas y devuelve distribuciones de probabilidad calibradas sobre las que el código cliente puede ramificar. Implementa la interfaz TypeSafe System One, el formato de cable del modelo Jev de TypeSafe AI (`POST /v1/systemone`), por lo que es una implementación independiente de una interfaz documentada ajena.

Técnicamente es un ajuste fino mediante LoRA r=32 sobre Qwen/Qwen3-4B-Instruct-2507 (4.022.468.096 parámetros totales), al que se le añaden cabezas de lectura específicas (MLP de 2 capas sobre el estado oculto final) para tres tipos de pregunta: `noul` (probabilidad de sí en [0,1]), `choice` (softmax sobre opciones, suma exacta a 1) y `score` (expectativa ponderada por probabilidad sobre niveles independientes). En servido se aplica además una mezcla verbalizadora que combina geométricamente los logits sí/no del backbone con la cabeza entrenada.

Es relevante porque cubre un nicho poco poblado: decisiones estructuradas y calibradas en lugar de chat. Se distribuye en dos variantes de la misma arquitectura —`meticulous` (confianza conservadora, pensada para tráfico desconocido o ruidoso) e `intuit` (más precisa en tráfico numérico, temporal y de políticas multi-paso, pero menos prudente en su confianza)—. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3) con cabezas de lectura de 2 capas sobre el estado oculto final; adaptadores LoRA r=32 sobre todas las proyecciones de atencion y MLP |
| Parametros totales | 4.022.468.096 (4,02 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen/Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repositorio distribuye pesos en safetensors sin cuantizaciones publicadas |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-sa-4.0 para los pesos; el codigo del proyecto es Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 8,1 GB |
| Variantes | kapteeni-v1-meticulous (esta), kapteeni-v1-intuit |
| Fecha de publicacion | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, que se congela primero para construir el pipeline de datos y despues se ajusta con LoRA de rango 32 aplicado a todas las proyecciones de atencion y MLP, durante una sola epoca sobre una mezcla de decisiones de 8,7 millones de tokens. Esa mezcla combina BoolQ y FEVER (etiquetados de forma suave por un profesor con acuerdo de k=5 muestras), Banking77, CLINC150, GoEmotions, HelpSteer2 y 3.600 elementos sinteticos de tipo temporal, numérico y de política con verdad de referencia por construccion. Las cabezas de lectura son MLP de 2 capas entrenadas exclusivamente con reglas de puntuacion propias (proper scoring rules), seguidas de escalado de temperatura por cabeza; las constantes de mezcla se ajustan sobre validacion mixta retenida.

La innovacion principal no esta en el backbone sino en el contrato de salida. El tipo `noul` usa una cabeza sigmoide sobre el estado oculto final y no es consistente con el complementario (P(A) + P(no-A) puede no sumar 1, replicando el comportamiento de la referencia). El tipo `choice` pasa cada opcion por el backbone con una cabeza compartida y aplica un softmax de grupo, garantizando suma exacta a 1. El tipo `score` trata los niveles como independientes y devuelve la expectativa ponderada, que puede caer entre niveles. En servido, la mezcla verbalizadora combina geometricamente los logits sí/no del propio backbone con la cabeza entrenada; `--readout head` y `--readout verb` permiten seleccionar las variantes puras. Se reporta una puerta de dominio fuera de distribucion usando MNLI excluido del entrenamiento, que se mantuvo entre 0,88 y 0,893 a lo largo de los 1.205 pasos.

## Capacidades

- Clasificacion con probabilidad calibrada: devuelve P(si) en [0,1] para preguntas binarias (`noul`), distribuciones normalizadas sobre opciones (`choice`) y expectativas sobre niveles (`score`).
- Enrutado por categorias definidas por el usuario en tiempo de inferencia, mediante el campo `criteria` de cada pregunta.
- Estimacion de intensidad o severidad en escalas ordinales (por ejemplo, nivel de frustracion de un cliente).
- Clasificacion de intenciones y dominios: el entrenamiento incluye CLINC150 y Banking77, orientados a intenciones conversacionales y consultas bancarias.
- Deteccion de emociones: GoEmotions forma parte de la mezcla de entrenamiento.
- Verificacion de afirmaciones: BoolQ y FEVER aportan senal de pregunta binaria y comprobacion factual.
- Evaluacion de calidad o preferencia: HelpSteer2 se usa para juicios de calidad.
- Razonamiento temporal, numérico y de políticas multi-paso: presente en los 3.600 elementos sinteticos, aunque el autor advierte que esta variante es poco fiable en juicios temporales y numéricos y debil en razonamiento multi-paso.
- Integracion como servicio HTTP compatible con `POST /v1/systemone`, y uso en proceso mediante `SystemOneModel.from_dist(...)`.
- No genera texto: la salida es exclusivamente estructurada (etiqueta, probabilidades, confianza).

## Casos de uso

- Triaje de tickets de soporte: el propio ejemplo de la model card envia el estado "Help! My payouts have been failing for 3 days." y pregunta simultaneamente por urgencia (`noul`), departamento responsable (`choice` con criterios de facturacion, tecnico y ventas) y nivel de frustracion (`score`). El modelo devuelve las tres respuestas en una sola llamada, lo que permite enrutar sin una fase de generacion.
- Enrutado de correo entrante por equipo: con preguntas de tipo `choice` y criterios definidos por el integrador, la salida se puede mapear directamente a una cola o a un sistema de tickets. Al sumar las probabilidades exactamente a 1, la logica de umbral es trivial de implementar.
- Deteccion de abuso o toxicidad en moderacion de contenido: las cabezas de tipo `score` permiten graduar la severidad en lugar de producir un binario, y la confianza reportada permite decidir si se escala a revision humana.
- Clasificacion de intenciones en asistentes conversacionales: la mezcla de entrenamiento incluye CLINC150 y Banking77, de modo que el modelo se puede usar como primer nivel de un enrutador que decida que habilidad o subagente debe atender la peticion.
- Verificacion de afirmaciones en pipelines de datos: con FEVER y BoolQ en el entrenamiento, una pregunta de tipo `noul` puede actuar como filtro barato antes de comprometer recursos de un modelo generativo mayor.
- Evaluacion automatica o filtrado por calidad: HelpSteer2 permite usar el tipo `score` para puntuar respuestas candidatas y seleccionar la mejor antes de mostrarla al usuario.
- Puerta en cascada para derivar a un LLM grande: dado que cada decision consume 597 tokens de entrada de media y la latencia p50 medida es de 0,17 s, el modelo puede absorber el trafico facil y derivar unicamente los casos de baja confianza.
- Clasificacion de riesgo o elegibilidad con umbrales auditables: al exponer probabilidades calibradas en lugar de texto, la logica de decision queda en el codigo del integrador y es trazable.

## Benchmarks y rendimiento

Datos autodeclarados por el autor sobre la mitad publica de JevBench v1.4 (231 decisiones publicas), evaluados con el codigo del propio benchmark y extremo a extremo a traves del servidor:

| Metrica | Valor |
|---|---|
| Puntuacion estilo JevBench | 65,71 |
| Intelligence | 60,3 |
| ECE de etiqueta principal | 0,0496 (Calibration 90,1) |
| Precision publica | 0,710 (facil 1,000 / estandar 0,889 / dificil 0,469) |
| Speed | 81,0 (p50 0,17 s, p95 1,2 s en iGPU AMD Strix Halo, con ajuste x2 por autohospedaje) |
| Cost | 42,4 (597 tokens de entrada por decision, a un precio asumido de 0,14 $/M en hospedado) |

El autor advierte explicitamente de que son cifras autodeclaradas sobre la mitad publica (los elementos de juez y sellados son privados y no constituyen un ranking oficial), de que todas las constantes de servido se pre-registraron sobre validacion retenida, de que Intelligence esta renormalizada sin el nivel de juez sellado, de que la calibracion mostrada es solo la mitad ECE y de que diferencias de unos pocos puntos caen dentro del ruido de una unica semilla (aproximadamente mas o menos 2-3 puntos compuestos medidos). No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no publicada por el autor): en BF16 en torno a 8 GB solo de pesos, con 10-12 GB recomendados contando activaciones y cache; en int8 en torno a 4 GB; en int4 en torno a 2,2-2,5 GB. Estas cifras son estimaciones derivadas del tamano, no datos del repositorio.
- GPU recomendadas: el autor reporta servicio sobre una iGPU AMD Strix Halo con latencia p50 de 0,17 s y p95 de 1,2 s. Para despliegue en produccion con mayor concurrencia, una A100 o H100 quedan sobradamente dimensionadas para 4B de parametros; una RTX 4090 permite BF16 con holgura.
- Cabe en GPU de consumo: si. En BF16 entra en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); en cuantizacion de 8 o 4 bits entraria en tarjetas de 8 GB.
- Opciones de despliegue: el paquete `kapteeni` incluido en el snapshot expone `python -m kapteeni.serve --dist . --port 8000` y una API en proceso mediante `SystemOneModel.from_dist(...)`. Los tags del repositorio declaran compatibilidad con text-embeddings-inference y endpoints. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados, por lo que esas rutas no estan disponibles sin conversion propia.
- Latencia y throughput: p50 0,17 s y p95 1,2 s medidos en iGPU AMD Strix Halo. El consumo declarado es de 597 tokens de entrada por decision. No se publican cifras de tokens por segundo ni de concurrencia maxima.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kapteeni-v1-meticulous | 4,02 B | Distribuciones calibradas (noul / choice / score), sin texto | no disponible | CC BY-SA 4.0 (pesos) | HuggingFace, 0 descargas |
| kapteeni-v1-intuit | 4,02 B (misma arquitectura) | Igual, con confianza menos conservadora | no disponible | CC BY-SA 4.0 (pesos) | Variante hermana del mismo autor |
| Jev (TypeSafe AI) | no disponible | Decisiones tipadas; interfaz de referencia | no disponible | no disponible | API hospedada abierta desde el 21 de septiembre de 2026, a 0,042 $/M tokens de entrada con salida gratuita |
| Qwen3-4B-Instruct-2507 | 4,02 B | Generacion de texto libre | no disponible | Apache-2.0 | Modelo base, ampliamente distribuido |

La comparacion con Jev es la mas pertinente por contrato de interfaz, pero el autor declara explicitamente que no esta afiliado ni respaldado por TypeSafe AI y que "Jev" es marca de esa empresa; esta ficha no debe interpretarse como una evaluacion oficial. Frente al modelo base Qwen3-4B-Instruct-2507, la diferencia es de proposito: el base genera texto, mientras que kapteeni devuelve exclusivamente estructuras de decision.

## Limitaciones y advertencias

- El modelo es primariamente en ingles; no se declara soporte de otros idiomas.
- El razonamiento sobre politicas largas y el razonamiento multi-paso son debiles: la precision en el nivel dificil del benchmark es de 0,469.
- En esta variante, el juicio temporal y numérico es poco fiable; el propio autor recomienda usar `-intuit` para ese tipo de trafico.
- Las probabilidades estan calibradas de forma agregada, pero las respuestas individuales no estan garantizadas como correctas; se recomienda ramificar segun la confianza cuando la decision tenga consecuencias.
- El tipo `noul` no es consistente con el complementario: P(A) + P(no-A) puede no sumar 1, por diseno. Cualquier logica de negocio que asuma complementariedad debe tenerlo en cuenta.
- La licencia de los pesos es CC BY-SA 4.0, lo que impone obligaciones de atribucion y de compartir bajo la misma licencia las obras derivadas. El archivo `WEIGHTS-LICENSE.md` recoge las obligaciones completas derivadas de MultiNLI (CC BY-SA 4.0) y FEVER (CC BY-SA 3.0).
- La procedencia de los datos incluye CLINC150, que no tiene licencia explicita y se describe como de uso exclusivamente investigador. Es un punto a revisar antes de un uso comercial.
- Los datos de benchmark son autodeclarados sobre la mitad publica de JevBench v1.4 y no constituyen un ranking oficial; las diferencias de pocos puntos caen dentro del ruido medido de una unica semilla (mas o menos 2-3 puntos compuestos).
- El repositorio presenta 0 descargas y 0 likes, y el pipeline declarado es text-classification aunque los tags incluyan text-generation; conviene verificar el comportamiento real antes de integrarlo.
- No hay pesos cuantizados ni formato GGUF publicados, lo que limita el despliegue en entornos que dependan de llama.cpp u Ollama.
- Riesgo de alucinacion: no aplica en el sentido habitual, porque el modelo no genera texto libre; el riesgo equivalente es una clasificacion o una probabilidad incorrecta presentada con alta confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TriusAI/kapteeni-v1-meticulous
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Documentacion de la interfaz TypeSafe System One: https://docs.typesafe.ai
- Jev AI Model (TypeSafe AI): https://jevmodel.org/
