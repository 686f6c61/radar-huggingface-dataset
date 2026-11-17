# wolfmanfx/gemma-4-E2B-it-A2UI-Express-ONNX

## Resumen

Gemma 4 E2B it A2UI Express ONNX es un ajuste fino (fine-tune) del modelo Gemma 4 E2B instruct de Google, publicado por el usuario wolfmanfx. El modelo está especializado en generar código fuente del DSL A2UI Express, un lenguaje declarativo que representa interfaces de usuario mediante constructores de componentes con nombre, listas, eventos y rutas de datos. El host compila esa salida en mensajes del protocolo A2UI 1.0 y renderiza componentes nativos de la aplicación. El ajuste se realizó mediante LoRA sobre una conversión MLX de 4 bits del modelo base, y se distribuye como sesiones ONNX de texto en cuantización q4f16 para su ejecución en navegador con Transformers.js y WebGPU.

El modelo resuelve un problema muy concreto: traducir peticiones en lenguaje natural a interfaces de usuario válidas según un catálogo de componentes fijo, sin necesidad de un backend. Con un tamaño de repositorio de 4,8 GB (de los cuales unos 3,1 GB corresponden a los pesos ONNX y 52 MB al adaptador MLX original), está pensado para demos y aplicaciones web que ejecutan inferencia localmente. La ventana de contexto debe acomodar el system guide completo, de aproximadamente 7.600 tokens, que se prefija en cada respuesta.

Es relevante ahora porque ejemplifica una tendencia doble: la especialización extrema de modelos pequeños en lenguajes de dominio (DSL) y el despliegue de inferencia en el navegador mediante WebGPU. No obstante, el alcance es limitado: solo genera texto, no procesa imagen, audio ni vídeo, y su calidad fuera de los casos curados del demo no ha sido evaluada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E2B), ajuste LoRA sobre todas las capas |
| Parametros totales | no disponible (modelo base Gemma 4 E2B; el ajuste LoRA es de rango 8) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como cifra oficial; el entrenamiento usa filas de hasta 12.288 tokens y el system guide ocupa unos 7.600 tokens |
| Tipos de cuantizacion | q4f16 (ONNX para Transformers.js/WebGPU); adaptador MLX entrenado sobre conversión 4-bit con group size 64 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (sesiones de texto q4f16) y adaptador MLX (`adapter-mlx/`, 52 MB) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E2B-it` (revisión `d36bdd3855c82a6a1a23f7c459b749f5724ae75d`), convertido a 4 bits con `mlx_lm.convert -q` y group size 64. Sobre esa base se aplicó un LoRA de rango 8, escala 2.0 (alpha 16) y dropout 0 en todas las capas, entrenado con `mlx_lm.lora`, learning rate 0.0001 con optimizador Adam, batch 1 y acumulación 1 con gradient checkpointing, semilla 3407 y tope de secuencia de 12.288 tokens con el prompt enmascarado. El checkpoint seleccionado es el paso 100 de una ejecución de 120 pasos. El trainer estándar agotó la memoria de Metal con las filas de 8k tokens, por lo que se usó una pérdida que aplica la cabeza de embeddings atados y la entropía cruzada por bloques de 512 posiciones bajo gradient checkpointing, con el mismo valor de pérdida y norma de gradiente que la pérdida por defecto pero menor pico de memoria.

Los datos de entrenamiento fueron generados por un profesor local Gemma 4 26B-A4B a partir de 96 semillas de escenario y validados con el compilador Express real, comprobaciones del grafo de componentes y de data-binding; los objetivos inválidos se descartaron. El conjunto consta de 159 filas (54 creaciones de vista, 54 respuestas a formularios enviados y 51 ediciones de una vista existente) y 21 filas de validación. Cada fila incluye el system guide completo, de unos 7,9k tokens, y la pérdida cubre únicamente el turno del asistente. Los valores de espaciado de los objetivos se reescribieron a los pasos de 4 px del catálogo. Se reservaron ocho casos fuera del entrenamiento. La pérdida de validación bajó de 0,484 hasta un valor no especificado en la información disponible.

## Capacidades

- Generación de código fuente en el DSL A2UI Express: constructores de componentes con nombre, listas, eventos y rutas de datos.
- Creación de vistas nuevas a partir de instrucciones en lenguaje natural.
- Respuestas a formularios enviados (54 filas de entrenamiento de este tipo).
- Edición de vistas existentes (51 filas de entrenamiento).
- Generación de texto conversacional en inglés, heredada del modelo base instruct.
- No soporta tool calling ni function calling según la información disponible.
- No soporta agentes ni razonamiento multi-paso de forma explícita; el modo thinking se desactiva en el ejemplo (`enable_thinking: false`).
- Sin capacidades multimodales en esta exportación: imagen, audio y vídeo quedan fuera de su alcance, pese a que el pipeline base sea image-text-to-text.
- Multilingüe limitado al inglés.

## Casos de uso

- Generación de interfaces en el navegador sin backend: una aplicación web carga el modelo con Transformers.js y WebGPU y convierte una petición en lenguaje natural en código Express, que se compila localmente en el cliente. Es el escenario del demo de CopilotKit Express.
- Creación de tarjetas informativas: el ejemplo curado de la model card pide una tarjeta con jerarquía visual clara y datos exactos (horarios, dirección, precio), un caso típico de vistas estáticas generadas dinámicamente.
- Formularios interactivos: el modelo puede generar vistas con campos de entrada y responder a los envíos de formularios, ya que el 34% de las filas de entrenamiento corresponden a respuestas a formularios.
- Edición incremental de interfaces: dado un grafo de componentes existente, el modelo produce modificaciones sobre la vista, útil para asistentes de edición visual dentro de una aplicación.
- Prototipado rápido de pantallas: un diseñador describe la pantalla deseada y obtiene código Express compilable, reduciendo el tiempo de iteración sobre el catálogo de componentes.
- Demos de inferencia local en dispositivos: al ejecutarse en WebGPU con pesos q4f16, permite mostrar generación de UI sin enviar datos del usuario a un servidor, relevante para entornos con requisitos de privacidad.
- Comparación de tamaños en pipelines de evaluación: el autor lo ofrece como alternativa pequeña frente a la exportación E4B, útil para medir el compromiso entre calidad y coste de inferencia en el navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de validación, que descendió de 0,484 durante el entrenamiento, sin cifra final ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ONNX q4f16 suman aproximadamente 3,1 GB, por lo que se necesita al menos esa cantidad de memoria de GPU; el adaptador MLX adicional ocupa 52 MB.
- GPU recomendadas: cualquier GPU con soporte de WebGPU y la extensión `shader-f16`; el autor probó con Chrome en modo headed real.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6-8 GB de VRAM o más, aunque no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: Transformers.js 4.3.2 con `device: "webgpu"` y `dtype: "q4f16"`; el adaptador MLX requiere la misma conversión 4-bit (`mlx_lm.convert -q`, group size 64) para carga nativa.
- Latencia y throughput: no disponibles como cifras. El autor advierte que la primera carga incluye una descarga sustancial y la configuración de la GPU, y que cada respuesta prefija el system guide de 7,6k tokens, lo que supone la mayor parte de la espera.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-E2B-it-A2UI-Express-ONNX | no disponible (base E2B) | no disponible (guia de 7,6k tokens) | DSL A2UI Express | apache-2.0 | ONNX q4f16, MLX |
| gemma-4-E4B-it-A2UI-Express-ONNX | no disponible (base E4B) | no disponible | DSL A2UI Express | apache-2.0 (segun repositorio enlazado) | ONNX |
| unsloth/gemma-4-E2B-it (base) | no disponible | no disponible | proposito general instruct | no disponible | safetensors, MLX |

El modelo E4B del mismo autor es la comparación natural: misma receta de entrenamiento y mismos datos, pero con el modelo base mayor, ofrecido como opción por defecto en el demo. No se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Alcance restringido a la generación de texto: no procesa imagen, audio ni vídeo, aunque el pipeline del modelo base sea image-text-to-text.
- Solo inglés: el campo de idiomas declara únicamente `en`.
- Calidad no evaluada fuera del demo: el autor indica explícitamente que la generación en bruto con solo el system guide no ha recibido una puntuación de calidad separada, y que las peticiones más amplias que las curadas pueden fallar.
- Dependencia del catálogo: el modelo debe usarse con el catálogo de componentes correspondiente al system guide (`system_prompt.txt`, SHA-256 `556fb4646aaba37240ab878b6262bb830aa5f826e2280f090759d9070af432ae`) y validar la salida con el compilador Express.
- Riesgo de alucinación en la sintaxis del DSL: el host debe validar el grafo de componentes y el data-binding, y el demo puede devolver feedback del compilador para reparaciones generadas por el modelo.
- Dataset y casos de evaluación no incluidos en el repositorio, lo que dificulta la reproducibilidad de la evaluación.
- Requiere fijar la revisión (`revision`) en despliegues, en lugar de una rama móvil.
- El adaptador MLX solo carga con la misma conversión 4-bit (group size 64) usada en el entrenamiento.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4, cuyos términos no se detallan en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wolfmanfx/gemma-4-E2B-it-A2UI-Express-ONNX
- Exportación E4B del mismo autor: https://huggingface.co/wolfmanfx/gemma-4-E4B-it-A2UI-Express-ONNX
- Demo de CopilotKit Express: https://a2ui-express-demo-8d8183.web.app/
- Especificación de A2UI Express: https://a2ui.org/specification/proposals/express/
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
