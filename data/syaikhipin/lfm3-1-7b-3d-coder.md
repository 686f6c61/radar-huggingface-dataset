# syaikhipin/LFM3-1.7B-3D-Coder

## Resumen

LFM3-1.7B-3D-Coder es un ajuste fino supervisado (SFT) del modelo base LiquidAI/LFM3-1.7B-Base, desarrollado por el usuario syaikhipin en el marco de un proyecto de portfolio vinculado a la Università degli Studi di Palermo. El modelo conserva la arquitectura y el tamano del original (1.728.801.536 parametros segun los pesos en safetensors) y se ha entrenado con TRL 1.18.0 sobre Transformers 5.23.0 para tareas de generacion de texto conversacional orientadas, por el nombre, a codigo en el ambito 3D.

El interes practico es limitado pero concreto: se trata de un derivado comunitario de un modelo pequeno (1,7B parametros) que puede ejecutarse en hardware de consumo y sirve como ejemplo reproducible de un pipeline SFT con TRL. No obstante, la model card es extremadamente escueta: no documenta el dataset de entrenamiento, el numero de tokens, los hiperparametros, los idiomas soportados ni la licencia efectiva del ajuste, y el repositorio no registra descargas ni interacciones.

Por su tamano y su naturaleza de ajuste fino sobre una base de LiquidAI, encaja en escenarios de prototipado local, generacion de codigo asistida en entornos con recursos limitados y experimentacion academica. Cualquier uso en produccion exigiria una evaluacion propia, dado que no hay benchmarks publicados ni una licencia declarada de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de LiquidAI/LFM3-1.7B-Base; detalles no disponibles) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base LiquidAI/LFM3-1.7B-Base, por lo que hereda su arquitectura de transformer y su tokenizador. La model card no detalla la arquitectura interna del base (tipo de atencion, uso de capas lineales o hibridas, etc.), de modo que esa informacion debe consultarse en el repositorio del modelo original de LiquidAI.

El entrenamiento se realizo mediante SFT con TRL 1.18.0, sobre Transformers 5.23.0, PyTorch 2.11.0, Datasets 5.0.0 y Tokenizers 0.23.3. El autor enlaza un run de Weights & Biases (proyecto `fde-3dcoder-portfolio`, run `og3j556u`) que constituye la unica fuente potencial de detalle sobre hiperparametros, composicion del dataset y curvas de perdida. No se documenta el volumen de tokens de entrenamiento, la procedencia de los datos, ni si hubo etapas de RLHF o DPO posteriores al SFT. Tampoco se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) mas alla de las que aporte el modelo base.

## Capacidades

- Generacion de texto conversacional en formato de chat (la model card muestra un ejemplo con `pipeline` y mensajes con rol `user`).
- Generacion de codigo presumiblemente orientada al dominio 3D, segun el nombre del modelo; no hay documentacion que lo confirme con ejemplos o evaluaciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Integracion con el ecosistema Transformers y `generated_from_trainer`, lo que facilita su carga con `pipeline` y su uso en flujos estandar de Hugging Face.

## Casos de uso

- Prototipado local de asistentes de codigo: al tener 1,7B parametros, puede cargarse en una GPU de consumo y usarse para autocompletar o explicar fragmentos de codigo en un entorno de desarrollo sin depender de APIs externas.
- Experimentacion academica con SFT: el repositorio y el run de W&B asociados sirven como referencia reproducible para cursos o proyectos que ensenen a ajustar un modelo base con TRL.
- Generacion de scripts para pipelines 3D: si el ajuste cumple su proposito declarado, podria asistir en la escritura de codigo de procesamiento de mallas, escenas o formatos 3D, siempre con revision humana.
- Base para nuevos ajustes finos: al ser un modelo pequeno y con licencia no restrictiva declarada de forma ambigua, puede servir como punto de partida para experimentos de destilacion o especializacion adicional.
- Chatbot tecnico de baja latencia: su tamano permite respuestas rapidas en CPU o GPU modesta para consultas de documentacion o dudas puntuales de programacion.
- Evaluacion comparativa de tecnicas de SFT: util para medir el efecto de distintas configuraciones de TRL sobre un mismo modelo base en tareas de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB para pesos; en 4 bits, en torno a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4070, A10, L4). Para cuantizacion 4/8 bits basta con GPUs de 4 GB o incluso CPU.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6 GB o mas en fp16, y en practicamente cualquier GPU con cuantizacion.
- Opciones de despliegue: Transformers con `pipeline`, vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF a partir de los safetensors (no se distribuyen GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| syaikhipin/LFM3-1.7B-3D-Coder | 1,73B | no disponible | no disponible | Hugging Face (0 descargas) |
| LiquidAI/LFM3-1.7B-Base | 1,7B (aproximado) | no disponible en esta ficha | la del modelo original de LiquidAI | Hugging Face |
| Qwen2.5-Coder-1.5B | 1,5B | no disponible en esta ficha | Apache 2.0 (habitual en la familia) | Hugging Face |
| DeepSeek-Coder-1.3B | 1,3B | no disponible en esta ficha | licencia especifica de DeepSeek | Hugging Face |

La comparacion de rendimiento no es posible porque el modelo no publica benchmarks. Frente a alternativas consolidadas de codigo en el rango 1-2B, la principal diferencia es la ausencia de evaluaciones y de documentacion sobre el dataset de entrenamiento, lo que dificulta justificar su eleccion frente a modelos con metricas publicas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de su calidad en generacion de codigo ni en tareas generales.
- Model card incompleta: no se especifican dataset, hiperparametros, idiomas ni licencia efectiva del ajuste.
- Licencia ambigua: el campo `licence: license` no aporta informacion; antes de un uso comercial debe verificarse la licencia del modelo base LiquidAI/LFM3-1.7B-Base y la del ajuste.
- Riesgo de alucinacion: como todo modelo de 1,7B, es propenso a generar codigo sintacticamente plausible pero incorrecto; requiere revision y pruebas automatizadas.
- Sesgos: no documentados; al desconocerse la composicion del dataset de SFT, no es posible evaluar sesgos de dominio, idioma o estilo.
- Limitaciones de contexto e idioma: no disponibles; no se puede garantizar un rendimiento adecuado en castellano ni en conversaciones largas.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia; no hay senales de uso comunitario ni de mantenimiento.
- Uso en produccion: no recomendable sin una evaluacion interna previa y sin aclarar la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syaikhipin/LFM3-1.7B-3D-Coder
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Run de entrenamiento en Weights & Biases: https://wandb.ai/syaikhipin-universit-degli-studi-di-palermo/fde-3dcoder-portfolio/runs/og3j556u
- Repositorio de TRL: https://github.com/huggingface/trl
