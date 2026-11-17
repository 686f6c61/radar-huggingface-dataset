# wunan6/Intern-Decision-0.8B-OneJev

## Resumen

Intern-Decision-0.8B-OneJev es un modelo de decisión tipada de 0,8 mil millones de parámetros construido por el usuario wunan6 sobre el backbone de lenguaje Qwen3.5-0.8B. No es un modelo generativo al uso: recibe un `state` (texto estructurado), opcionalmente imágenes, y un conjunto de preguntas tipadas (`choice`, `score` y `noul` para sí/no), y devuelve una probabilidad por cada opción suministrada. La arquitectura combina el transformer de Qwen3.5 con cabeceras de decisión entrenadas mediante enmascaramiento del siguiente token, manteniendo congelados el tower de visión y el proyector.

El modelo se entrena con la receta Intern-Decision sobre el release público OneJev-Data, que contiene 62.685 filas de texto e imagen (las filas de vídeo se excluyen y los objetivos suaves se convierten a etiquetas duras mediante argmax). Está pensado para escenarios de agentes y sistemas "system-one" donde se necesita una decisión rápida, acotada y con probabilidad calibrada en lugar de una generación libre de texto.

Su relevancia actual radica en que ofrece un motor de decisión determinista y verificable con contexto de 8.192 tokens, límites explícitos de 62 opciones por pregunta y 16 preguntas por petición, y rechazo explícito de peticiones que excedan esos límites en lugar de truncarlas. La licencia heredada es de investigación (qwen-research), lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-0.8B) con cabeceras de decisión enmascaradas (masked-next-token decision heads); tower de visión y proyector congelados |
| Parametros totales | 0,8B (backbone Qwen3.5-0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de 0,8B parámetros, y le añade cabeceras de decisión que se entrenan con la receta Intern-Decision: en lugar de generar texto libre, el modelo enmascara el siguiente token y produce una probabilidad por cada símbolo de respuesta de un solo token (hasta 62 opciones por pregunta `choice`). El tower de visión y el proyector del backbone permanecen congelados durante el entrenamiento, de modo que la adaptación se concentra en las cabeceras sobre el backbone de lenguaje. La inferencia se ejecuta con las cabeceras enmascaradas de XTuner.

El entrenamiento se realizó sobre el release público OneJev-Data (62.685 filas de texto e imagen, excluyendo vídeo), con objetivos suaves convertidos a etiquetas duras mediante argmax y reteniendo cada fila número 50 para calibración. Se hicieron 2 épocas, 2.300 pasos, batch global de 16, learning rate 2e-6 con schedule coseno y precisión bf16. El modelo acepta como máximo 16 preguntas por petición y rechaza (no trunca) solicitudes más largas o con más opciones de las permitidas.

## Capacidades

- Clasificación y decisión tipada: preguntas `choice` (elección entre hasta 62 opciones), `score` (puntuación) y `noul` (sí/no).
- Entrada multimodal: acepta `state` textual y, opcionalmente, imágenes.
- Salida probabilística: devuelve una probabilidad por cada opción suministrada, lo que permite umbrales y calibración.
- Razonamiento de un solo paso ("system-one"): decisiones acotadas sin cadena de pensamiento generativa.
- Integración con pipelines de agentes mediante el motor `DecisionEngine` del repositorio Intern-Decision.
- Soporte de contexto de 8.192 tokens para estados largos.
- No soporta tool calling ni function calling de forma nativa (no disponible en la información proporcionada).
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutamiento de decisiones en agentes: dado un estado estructurado (por ejemplo, condiciones de entorno y métricas), el modelo elige entre un conjunto acotado de acciones con una probabilidad por opción, lo que permite integrar umbrales de confianza en el orquestador.
- Clasificación de tickets de soporte: con preguntas `choice` sobre categorías predefinidas, el modelo asigna una probabilidad a cada categoría y facilita el triaje automático con contexto de hasta 8.192 tokens.
- Verificación de políticas y seguridad: con preguntas `noul` (sí/no) sobre un estado y criterios definidos, sirve para decidir si una acción cumple una política, con probabilidad calibrada para auditar falsos positivos.
- Decisión multimodal sobre imágenes: al aceptar imágenes junto al `state`, puede decidir entre opciones a partir de una captura o documento, por ejemplo para validar si una imagen cumple un criterio.
- Puntuación de candidatos: con preguntas `score`, asigna una puntuación a alternativas (respuestas, anuncios, configuraciones) para ranking y selección.
- Evaluación de modelos de decisión: el checkpoint incluye el kit de reproducción del Decision Index (`decision-index/di_engine.py`) para comparar motores de decisión con la misma interfaz.
- Simulación de escenarios acotados: con estados estructurados (clima, temperatura, etc.) y preguntas `choice`, permite construir simuladores de decisión deterministas y reproducibles.

## Benchmarks y rendimiento

Resultados públicos de siete suites del repositorio Intern-Decision (temperatura 1.0):

| Suite | Precisión |
|---|---|
| Jevbench-easy | 100,0 |
| Jevbench-original | 81,9 |
| Jevbench-hard | 45,1 |
| Typed Decisions | 51,9 |
| ToolACE | 82,6 |
| AG News | 84,9 |
| WildJailBreak | 53,9 |

El índice Decision Index público se reproduce con los ficheros de `decision-index/` incluidos en el repositorio y los resultados del dataset de resultados; no se proporcionan cifras adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (0,2 GB) y los 0,8B parámetros, la inferencia en bf16 requiere del orden de 1,6-2 GB de pesos más overhead de activaciones y del motor XTuner.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente, aunque no se confirma en la información.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque no se confirma en la información.
- Opciones de despliegue: motor `DecisionEngine` del repositorio Intern-Decision con backend `xtuner`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El modelo se posiciona como un motor de decisión tipada sobre Qwen3.5-0.8B, una categoría distinta de los modelos generativos de propósito general, por lo que la comparación directa con LLM de texto no resulta equivalente. No disponible.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial; el checkpoint hereda además las restricciones por fuente del dataset OneJev-Data, algunas de carácter solo investigación o no comercial.
- Límites estrictos de entrada: máximo 16 preguntas por petición y 62 opciones por pregunta `choice`; las peticiones que exceden estos límites se rechazan, no se truncan.
- Contexto limitado a 8.192 tokens.
- No es un modelo generativo: no produce texto libre ni cadenas de razonamiento; su salida son probabilidades por opción.
- Riesgo de alucinación en el sentido de decisiones erróneas con alta confianza, especialmente en Jevbench-hard (45,1) y Typed Decisions (51,9), donde la precisión es moderada.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Sesgos conocidos: no disponible.
- Sin datos publicados de latencia, throughput ni requisitos de hardware verificados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/wunan6/Intern-Decision-0.8B-OneJev
- Repositorio Intern-Decision: https://github.com/intlm/Intern-Decision
- Dataset OneJev-Data: https://huggingface.co/datasets/OmniJev/OneJev-Data
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
