# THUSI-Lab/GameScaling-0.8B-S1

## Resumen

GameScaling-0.8B-S1 es un modelo multimodal de tipo image-text-to-text desarrollado por THUSI-Lab en colaboración con el equipo de I+D de Honkai AI de miHoYo, la Universidad de Tsinghua, la Universidad de la Academia China de Ciencias, la Universidad de Hong Kong, la Universidad Nacional de Singapur y la Universidad de Pekín. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B, orientado específicamente a la actuación de agentes encarnados (embodied agents) en entornos de videojuego mediante control de teclado y ratón.

El modelo forma parte de la familia GameScaling, presentada en el artículo "Scaling in Games: Continued Pre-Training for Embodied Agents in Diverse Virtual Worlds" (arXiv:2610.28698). La propuesta central es el preentrenamiento continuado sobre datos de múltiples mundos virtuales para que un modelo relativamente pequeño pueda interpretar observaciones visuales del juego y emitir acciones de bajo nivel (pulsaciones de teclas y movimientos de ratón) de forma coherente. La variante S1 corresponde a una de las etapas o configuraciones de entrenamiento de la familia, disponible también en tamaños de 0.8B, 2B, 9B y 27B.

Con 1.107.265.600 parámetros reales según los pesos en safetensors y un repositorio de 2,2 GB, es un modelo compacto pensado para iteración rápida y despliegue en hardware modesto. Su relevancia actual radica en que demuestra que el preentrenamiento continuado a escala reducida puede producir agentes de juego funcionales, un nicho donde los modelos generalistas de gran tamaño resultan caros e innecesariamente lentos para bucles de interacción en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-0.8B |
| Parametros totales | 1.107.265.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 2,2 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal capaz de procesar entradas de imagen y texto. Sobre esa base, THUSI-Lab aplica un proceso de preentrenamiento continuado (continued pre-training) con datos procedentes de diversos mundos virtuales, según describe el artículo asociado. El objetivo declarado es el entrenamiento de agentes encarnados que operan mediante teclado y ratón, lo que implica que el modelo aprende a mapear observaciones visuales del juego a secuencias de acciones de control de bajo nivel.

La información disponible no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La variante S1 se presenta junto a S3 dentro de la familia, lo que sugiere distintas etapas o configuraciones del pipeline de preentrenamiento continuado, pero la model card no especifica en qué se diferencian más allá de la nomenclatura. Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa o atención lineal.

## Capacidades

- Procesamiento conjunto de imagen y texto (image-text-to-text): interpreta observaciones visuales del entorno de juego y las combina con instrucciones textuales.
- Actuación como agente encarnado en videojuegos: emite acciones de teclado y ratón para controlar al personaje o la interfaz.
- Preentrenamiento continuado sobre múltiples mundos virtuales, lo que busca generalización entre distintos juegos o entornos.
- Generación de texto conversacional en inglés, heredada del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: orientado a bucles de acción, aunque no se detalla el mecanismo de planificación.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, visión especializada o audio: no disponible en la información proporcionada.

## Casos de uso

- Agentes de juego automatizados: el modelo puede recibir capturas de pantalla del juego y emitir secuencias de teclas y movimientos de ratón, lo que permite construir bots que juegan de forma autónoma en entornos donde el control sea de tipo teclado-ratón.
- Investigación en agentes encarnados: sirve como banco de pruebas de bajo coste para estudiar cómo el preentrenamiento continuado en mundos virtuales transfiere habilidades entre entornos, gracias a su tamaño compacto y a su licencia permisiva.
- Evaluación de generalización entre juegos: al haberse entrenado sobre múltiples mundos virtuales, es adecuado para medir la transferencia de políticas de control de un juego a otro en experimentos académicos.
- Pruebas de calidad (QA) automatizadas de videojuegos: un agente basado en este modelo puede recorrer menús, reproducir secuencias de interacción y detectar fallos de interfaz sin intervención humana.
- Generación de datos sintéticos de interacción: el modelo puede registrar trayectorias de acciones en distintos juegos para alimentar posteriores entrenamientos o análisis de comportamiento.
- Prototipado rápido en hardware de consumo: con 1,1B parámetros y pesos en safetensors de 2,2 GB, permite iterar en una sola GPU consumer antes de escalar a las variantes de 2B, 9B o 27B de la misma familia.
- Educación y demos de IA para videojuegos: su licencia Apache 2.0 y su reducido tamaño facilitan su uso en cursos y talleres sobre agentes multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,1B parámetros, en FP16 se requieren aproximadamente 2,2 GB solo para los pesos, más el overhead del procesador visual y del contexto.
- Cuantización: los tipos de cuantización no están documentados en la información proporcionada; al ser un modelo de transformers con safetensors, sería necesario convertirlo a GGUF u otros formatos para cuantizarlo.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar funcionamiento en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3060 en adelante), pero no se confirma en la documentación.
- Cabe en GPU consumer: probablemente sí por el número de parámetros, aunque la información no lo confirma.
- Opciones de despliegue: transformers es la librería declarada; el tag endpoints_compatible sugiere compatibilidad con los endpoints de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GameScaling-0.8B-S1 | 1,1B | no disponible | Apache 2.0 | Agente encarnado en videojuegos (image-text-to-text) |
| GameScaling-0.8B-S3 | no disponible | no disponible | Apache 2.0 | Variante S3 de la misma familia |
| GameScaling-2B-S1 | no disponible | no disponible | Apache 2.0 | Misma familia, mayor tamaño |
| Qwen/Qwen3.5-0.8B | no disponible | no disponible | no disponible | Modelo base multimodal generalista |

La información disponible no permite comparar rendimiento numérico con alternativas de otras familias, ya que no se publican benchmarks en la model card.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés, por lo que su uso en castellano u otros idiomas no está garantizado.
- Dominio restringido: está especializado en actuación de agentes en videojuegos con teclado y ratón; su rendimiento fuera de ese dominio no está documentado.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de un modelo base generalista y entrenarse con datos de juegos, puede heredar sesgos de ambas fuentes.
- Alucinación: no se evalúa explícitamente; en tareas de control de juego, una acción incorrecta puede tener consecuencias inmediatas en el entorno.
- Contexto: la longitud de contexto no está disponible, lo que dificulta planificar despliegues con historiales largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B, cuya licencia no se detalla en la información proporcionada.
- Producción: al ser un modelo de investigación con pocas descargas (589) y sin benchmarks publicados, no se recomienda su uso en producción sin una evaluación propia previa.
- Diferenciación S1/S3: la documentación no aclara las diferencias funcionales entre variantes, lo que complica la selección.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S1
- Artículo en arXiv: https://arxiv.org/abs/2610.28698
- Página de paper en Hugging Face: https://huggingface.co/papers/2610.28698
- Repositorio GitHub: https://github.com/THUSI-Lab/GameScaling
- Página del proyecto: https://gamescaling.github.io
- Variante 0.8B-S3: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S3
- Variante 2B-S1: https://huggingface.co/THUSI-Lab/GameScaling-2B-S1
- Variante 2B-S3: https://huggingface.co/THUSI-Lab/GameScaling-2B-S3
- Variante 9B-S1: https://huggingface.co/THUSI-Lab/GameScaling-9B-S1
- Variante 9B-S3: https://huggingface.co/THUSI-Lab/GameScaling-9B-S3
- Variante 27B-S1: https://huggingface.co/THUSI-Lab/GameScaling-27B-S1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
