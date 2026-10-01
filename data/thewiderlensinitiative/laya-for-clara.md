# TheWiderLensInitiative/laya-for-clara

## Resumen

laya-for-clara es un modelo de clasificación de intención, no generativo, desarrollado por TheWiderLensInitiative como componente de enrutamiento del asistente personal Clara. Se trata de un fine-tune del modelo convaiinnovations/laya, que a su vez se construye sobre un encoder ModernBERT-large al que se añade una cabeza de decisión; el checkpoint resultante cuenta con 421.293.830 parámetros y un contexto heredado de 512 tokens. Su función es responder a dos preguntas acotadas sobre cada mensaje del usuario: la ruta (`chat`, `task` o `schedule`) y el esfuerzo requerido (`quick` o `deep`).

El modelo resuelve un problema de orquestación: Clara decide con esta salida si responde directamente con el modelo local (rápido), si delega en un agente con herramientas o si programa un recordatorio, y si activa o desactiva el modo de razonamiento extendido. Frente a un LLM generativo, laya-for-clara devuelve probabilidades calibradas en una sola pasada hacia delante y en aproximadamente 0,35 segundos sobre CPU, lo que lo hace apto para ejecutarse íntegramente en el ordenador del usuario.

Es relevante ahora porque ejemplifica el patrón de "modelo de decisión tipo System 1" como pieza previa a un LLM grande: una cabeza de clasificación barata que filtra, enruta y ahorra cómputo. El modelo está publicado únicamente en inglés, bajo licencia Apache-2.0, y su uso previsto es el de router dentro del proyecto Clara, no el de un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional ModernBERT-large mas cabeza de decision (fine-tune de convaiinnovations/laya) |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base Laya / ModernBERT-large) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Laya, un "motor de decisión System 1" construido sobre ModernBERT-large (encoder bidireccional) al que se añade una cabeza de decisión. No es un modelo autorregresivo: recibe un estado de entrada y unas opciones definidas en tiempo de petición, y devuelve en una sola pasada una elección junto con probabilidades calibradas. El checkpoint laya-for-clara es un fine-tune de ese modelo base sobre dos tareas concretas: clasificar la ruta (`chat`, `task`, `schedule`) y clasificar el esfuerzo (`quick`, `deep`).

El entrenamiento utilizó 1.343 ejemplos de enrutamiento y 538 ejemplos de esfuerzo, en su mayoría generados con Bonsai 2 27B (sin razonamiento) y complementados con casos difíciles escritos a mano; todos los datos son sintéticos, sin mensajes reales de usuarios. Se empleó la receta propia de Laya (recompensa de regla de puntuación adecuada junto con entropía cruzada), 3 épocas sobre una única RTX 3060 de 12 GB en aproximadamente 4 minutos, seguido de una calibración de temperatura sobre un split reservado.

## Capacidades

- Clasificación de intención sobre dos ejes: `route` (`chat`, `task`, `schedule`) y `effort` (`quick`, `deep`).
- Devolución de probabilidades calibradas por opción, aptas para umbralizar y registrar.
- Inferencia en una sola pasada, sin generación de texto, con latencia aproximada de 0,35 segundos en CPU.
- Selección de modo de razonamiento aguas abajo: activa o desactiva el modo de pensamiento del agente (rápido frente a profundo).
- Diseñado para un asistente personal que maneja ordenador, correo, calendario, archivos, música y domótica.
- Idiomas: únicamente inglés.
- No soporta tool calling ni function calling por sí mismo; es el componente que decide cuándo se activa el agente con herramientas.
- No genera respuestas: clasifica, no contesta.

## Casos de uso

- Enrutamiento de mensajes en el asistente local Clara: cada mensaje entrante se clasifica como `chat`, `task` o `schedule` en 0,35 segundos sobre CPU, de modo que las conversaciones triviales las responde el modelo local y solo las tareas o la programación activan el agente con herramientas o el gestor de recordatorios.
- Control de coste y latencia en pipelines de agentes: al decidir entre modo `quick` y `deep`, el sistema evita activar razonamiento extendido en peticiones simples; Clara solo toma la vía rápida cuando `probabilities["quick"] >= 0.8` y deriva cualquier caso dudoso al agente con pensamiento activado.
- Triaje de solicitudes de programación: el modelo identifica mensajes tipo `schedule` para derivarlos a recordatorios sin pasar por un LLM generativo, reduciendo el consumo de recursos en un equipo doméstico.
- Filtro previo antes de un LLM grande: dado que devuelve probabilidades calibradas y auditables, puede colocarse delante de un modelo mayor para descartar o clasificar consultas y reservar el cómputo pesado para los casos que lo requieran.
- Asistente personal para gestión de archivos y aplicaciones: la etiqueta `task` activa el agente que opera sobre el escritorio (correo, calendario, archivos, música, domótica), delegando en herramientas solo cuando el modelo detecta intención de acción.
- Enrutamiento reproducible y auditable en entornos con restricciones de privacidad: al ejecutarse enteramente en local y no requerir red, encaja en despliegues donde los mensajes del usuario no pueden salir del dispositivo.
- Evaluación de intenciones en sistemas de atención al cliente (uso potencial, con la limitación de que el modelo está ajustado al dominio del asistente personal Clara y solo en inglés).

## Benchmarks y rendimiento

Evaluación sobre conjuntos de test reservados y etiquetados a mano (no usados en entrenamiento):

| Tarea | Precision | Notas |
|---|---|---|
| route | 39 / 40 | el unico fallo tuvo baja confianza; Clara revalida rutas de baja confianza con el LLM local |
| effort | 40 / 40 | Laya base en zero-shot: 30 / 40 (todos los fallos enviaban una tarea dificil a la via rapida) |

| Metrica de rendimiento | Valor |
|---|---|
| Latencia de inferencia (CPU) | ~0,35 s por mensaje para ambas preguntas |
| Latencia del motor Laya (referencia del proveedor) | sub-35 ms (cifra del fabricante para Laya, no especifica de este checkpoint) |

Los conjuntos de test son pequenos (40 ejemplos por tarea), por lo que no deben tomarse como una estimacion robusta de rendimiento en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 0,8 GB; en precisión completa los 421M parámetros ocupan del orden de 1,7 GB y en fp16 alrededor de 0,85 GB (estimación a partir del recuento de parámetros; el autor no publica cifras de cuantización).
- Diseñado para ejecutarse en CPU: el autor reporta ~0,35 s por mensaje en CPU, y el ejemplo de uso del README emplea `device="cpu"`.
- GPU recomendadas: no disponible (el modelo es lo bastante pequeño para cualquier GPU consumer; el fine-tune se realizó en una RTX 3060 de 12 GB).
- Cabe en GPU consumer: sí, por tamaño (un modelo de 421M parámetros), aunque su objetivo declarado es la inferencia en CPU.
- Opciones de despliegue: la librería `laya` (por ejemplo, `laya.Agent`) y el pipeline del proyecto Clara; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput: latencia de ~0,35 s en CPU por mensaje; el autor no publica cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Tarea | Licencia | Estado |
|---|---|---|---|---|---|---|
| laya-for-clara | 421M | 512 tokens | en | Clasificacion de ruta y esfuerzo para Clara | Apache-2.0 | Publicado (TheWiderLensInitiative) |
| Laya (raiz en ingles) | 421M | 512 tokens | en | Motor de decision generico (zero-shot) | Apache-2.0 | Base; 30/40 en effort zero-shot |
| Laya multilingue | 322M (mmBERT-base) | no disponible | 100+ idiomas | Enrutamiento multilingue | no disponible | Variante de la familia |

No se dispone de datos sobre otros routers comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Clasifica, no responde: un `quick` incorrecto degrada la calidad de la respuesta y un `deep` incorrecto añade tiempo; el modelo no genera contenido.
- Dominio estrecho: ajustado para un asistente personal que usa ordenador, correo, calendario, archivos, música y domótica; fuera de ese dominio su precisión puede caer.
- Datos de entrenamiento completamente sintéticos (generados con Bonsai 2 27B más casos manuales) y conjuntos de test de solo 40 ejemplos por tarea; se esperan errores en mensajes distintos a los del entrenamiento.
- El valor de `confidence` del checkpoint ronda 0,7 para todas las respuestas; debe usarse `probabilities` en su lugar, según advierte el propio autor.
- Licencia Apache-2.0, igual que su modelo base, lo que permite uso comercial sin restricciones adicionales declaradas.
- Riesgo de alucinacion: no aplica de forma directa al ser un clasificador, pero una clasificacion errónea puede provocar que el agente aguas abajo realice una accion no deseada.
- Descargas registradas: 0; el checkpoint es muy reciente y con escasa validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheWiderLensInitiative/laya-for-clara
- Repositorio de Clara (codigo fuente y datos de entrenamiento en `laya/`): https://github.com/TheWiderLensInitiative/clara
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- ModernBERT-large (Answer.AI): https://huggingface.co/answerdotai/ModernBERT-large
- Sitio de Laya (ConvAI Innovations): https://laya.convaiinnovations.com/
- Laya AI: https://layaai.org/
- Que es Laya AI: https://laya-ai.com/what-is-laya
- Blog de HuggingFace sobre el modelo Laya: https://huggingface.co/blog/sora-2/laya-ai-model-how-it-works-run-it-locally-and-eval
- Acerca de Laya AI: https://laya-ai.com/about
