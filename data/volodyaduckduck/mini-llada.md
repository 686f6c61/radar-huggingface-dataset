# volodyaDuckDuck/mini-llada

## Resumen

Mini-LLaDA es una reimplementación a pequeña escala de LLaDA, un modelo de lenguaje de difusión enmascarada presentado en el artículo arXiv 2502.09992. Lo desarrolla el usuario volodyaDuckDuck y se distribuye en formato ONNX a través de Hugging Face. A diferencia de los modelos autorregresivos clásicos, genera texto desenmascarando tokens de forma iterativa y bidireccional en lugar de predecir el siguiente token de izquierda a derecha.

El modelo tiene 33 millones de parámetros y está entrenado desde cero sobre el dataset TinyStories (roneneldan/TinyStories), por lo que su dominio se limita a la generación de cuentos infantiles cortos en inglés. No es un modelo de propósito general: es una pieza didáctica y experimental que permite estudiar el paradigma de difusión enmascarada con un coste computacional mínimo y ejecución íntegra en el navegador.

Su relevancia actual es doble: por un lado, acerca la familia LLaDA a entornos con recursos muy limitados (el checkpoint int8 ocupa 33 MB), y por otro, ofrece una implementación ONNX autocontenida con demo web, útil para investigadores que quieran experimentar con decodificación no autorregresiva sin infraestructura de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional predictor de máscaras (difusión enmascarada, estilo LLaDA) |
| Parametros totales | 33M (según el título de la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | fp32 (model.onnx, 132 MB) e int8 dinámica (model_int8.onnx, 33 MB) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | ONNX (model.onnx, model_int8.onnx) + tokenizer.json |
| Capas / cabezas / dimensión | 8 capas, 8 cabezas, dim 512 |
| Normalización / activación | RMSNorm, SwiGLU |
| Codificación posicional | RoPE |
| Vocabulario | BPE byte-level, 8.000 tokens |
| Entrada / salida | `ids` int64 `[1, T]` (posiciones enmascaradas = `mask_id`) / `logits` `[1, T, 8000]` |
| Dataset de entrenamiento | roneneldan/TinyStories |
| Checkpoint | paso 60.000 |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un Transformer bidireccional que actúa como predictor de máscaras: recibe una secuencia de identificadores en la que algunas posiciones están sustituidas por el token especial `mask_id` y devuelve logits para todas las posiciones (`[1, T, 8000]`). La generación se realiza por difusión enmascarada, desenmascarando tokens de forma iterativa hasta completar la secuencia, en lugar de la decodificación autorregresiva convencional. La arquitectura emplea 8 capas, 8 cabezas de atención, dimensión 512, RoPE para la posición, RMSNorm y SwiGLU en las capas feed-forward, con un contexto máximo de 256 tokens.

El entrenamiento se hizo desde cero sobre el dataset TinyStories, un corpus de cuentos infantiles cortos en inglés, y el checkpoint publicado corresponde al paso 60.000. No se dispone de información sobre el número total de tokens vistos, la composición exacta del dataset, el uso de RLHF/DPO ni detalles del schedule de entrenamiento o de la función de pérdida de difusión más allá de lo indicado en la model card. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto breve en inglés: cuentos infantiles cortos, coherentes con el estilo de TinyStories.
- Generación no autorregresiva mediante desenmascaramiento iterativo (difusión enmascarada), con control del número de pasos de desenmascarado.
- Relleno condicionado por posiciones enmascaradas: al aceptar una secuencia con `mask_id` en posiciones concretas, permite completar huecos de forma bidireccional.
- Ejecución en navegador mediante ONNX Runtime Web (demo oficial).
- Inferencia en CPU con la versión int8 (33 MB), sin necesidad de GPU.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de razonamiento multi-paso, matemáticas avanzadas ni generación de código.
- No dispone de visión, audio ni modo thinking.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Docencia y divulgación sobre modelos de difusión: el modelo permite explicar en clase o en un artículo cómo funciona el desenmascarado iterativo frente a la generación autorregresiva, con un coste de ejecución mínimo y una demo en navegador.
- Experimentación académica con decodificación no autorregresiva: sirve como banco de pruebas para comparar estrategias de desenmascarado (orden, número de pasos, remasking) sin necesidad de GPU.
- Generación de cuentos infantiles cortos en inglés: adecuado para prototipos de aplicaciones educativas o de entretenimiento infantil, siempre dentro del dominio TinyStories y con revisión humana.
- Relleno de texto condicionado: al aceptar secuencias con posiciones enmascaradas, puede emplearse para completar frases o huecos en textos cortos en inglés en tareas de demostración.
- Inferencia en el navegador o en dispositivos sin GPU: la versión int8 (33 MB) permite desplegar la demo en clientes web mediante ONNX Runtime Web, útil para demos interactivas sin backend.
- Pruebas de integración de pipelines ONNX: sirve para validar flujos de exportación, cuantización dinámica int8 y ejecución con ONNX Runtime en entornos de CI o de prototipado.
- Referencia para reimplementaciones: el código del repositorio GitHub asociado puede usarse como base para entrenar variantes mayores de LLaDA sobre otros corpus pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para el modelo (132 MB de pesos) más activaciones; en la práctica cabe en CPU.
- GPU recomendadas: no se requieren; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) puede ejecutarlo con holgura, pero no es necesario.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria; también en CPU y en navegador.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web para navegador), según los artefactos publicados. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (formatos no soportados por estos motores en la información disponible).
- Latencia y throughput: no disponibles. El tamaño del modelo (33M parámetros, contexto 256) sugiere latencias muy bajas en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini-LLaDA (este modelo) | 33M | 256 | Difusión enmascarada | no disponible | ONNX en Hugging Face |
| LLaDA (original, arXiv 2502.09992) | no disponible en la información proporcionada | no disponible | Difusión enmascarada | no disponible | no disponible |
| Modelos autorregresivos pequeños tipo GPT-2 | ~124M (referencia habitual) | 1.024 (referencia habitual) | Autorregresivo | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente con TinyStories, genera cuentos infantiles cortos en inglés; fuera de ese dominio la calidad será baja.
- Contexto muy limitado: 256 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo inglés: no soporta castellano ni otros idiomas.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación y de contenido incoherente: al ser un modelo de 33M entrenado con cuentos sintéticos, la coherencia global es limitada.
- Sesgos: no documentados; el corpus TinyStories es sintético y puede contener sesgos de estilo y de temática propios del dataset.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: no apto para aplicaciones de agentes o pipelines complejos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-17) es futura respecto a la información habitual de publicación; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/volodyaDuckDuck/mini-llada
- Demo en navegador: https://aleksanyan-volodya.github.io/llada/
- Código: https://github.com/aleksanyan-volodya/LLaDA_interactive
- Paper LLaDA: https://arxiv.org/abs/2502.09992
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
