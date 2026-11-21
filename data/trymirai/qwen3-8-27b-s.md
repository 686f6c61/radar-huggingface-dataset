# trymirai/Qwen3.8-27B-S

## Resumen

Qwen3.8-27B-S es una cuantización de alta calidad del modelo Qwen/Qwen3.8-27B, desarrollada por trymirai (Mirai Labs) y publicada bajo licencia Apache 2.0. El objetivo es reducir drásticamente el peso del modelo (de un repo original de gran tamano a un checkpoint de 95,9 GB) manteniendo una fidelidad alta respecto al modelo profesor, para permitir inferencia local eficiente en Apple silicon. El checkpoint declara 8.682.731.728 parámetros almacenados en safetensors, aunque el modelo base se denomina "27B", lo que sugiere que el nombre comercial y el recuento real de pesos no coinciden.

La innovación principal es el método de cuantización de Mirai Small: cuantización con trellis coding de estilo QTIP, con bits por matriz seleccionados según la divergencia KL medida, rotaciones aleatorias de estructura Kronecker para reducir outliers, un codebook de retícula D4 de 2 bits para el embedding de entrada y enteros de 4 bits con grupo de tamano 64 y transformadas de Hadamard de bloque 32 para la cabeza de salida. El proceso combina cuantización post-entrenamiento con destilación consciente de la cuantización, incluyendo una ronda sobre los propios turnos de agente del modelo.

Es relevante ahora porque demuestra que es posible llevar un modelo de la clase 27B a un formato de muy bajo bit-width (2 bits en partes del modelo) con una degradación medida y publicada (KL 0,0803292 y 90,62% de acuerdo top-1 frente al profesor), algo poco habitual en el ecosistema open source, aunque con la limitación importante de que solo se soporta inferencia en Apple silicon mediante el runtime propietario `uzu`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base Qwen3.8-27B; no se detalla en la model card de la cuantizacion) |
| Parametros totales | 8.682.731.728 (safetensors del checkpoint cuantizado); modelo base etiquetado como 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit (embedding de entrada con retícula D4), 4-bit enteros con grupo 64 y Hadamard bloque 32 (cabeza de salida), bits por matriz elegidos por KL medida (QTIP-style trellis-coded) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.8-27B, un transformer del que esta ficha no detalla capas, dimensiones ni mecanismos de atención, ya que la model card de la cuantización remite a la del modelo original. Lo que sí se especifica es el pipeline de compresión: cuantización post-entrenamiento con trellis-coded quantization de estilo QTIP, donde el número de bits de cada matriz se elige a partir de la divergencia KL medida, no de forma uniforme. Se aplican rotaciones aleatorias con estructura de Kronecker para mitigar los valores atípicos de los pesos, un codebook de retícula D4 de 2 bits para el embedding de entrada y cuantización entera de 4 bits con grupo de tamano 64 más transformadas de Hadamard de bloque 32 para la cabeza de salida.

Tras la cuantización se realiza una destilación consciente de la cuantización (quantization-aware distillation) contra el modelo profesor, incluyendo una ronda adicional sobre los propios turnos de agente generados por el modelo. La evaluación de fidelidad se hizo con la herramienta `romakl` sobre su conjunto por defecto: 20 conversaciones y 14.456 tokens de continuación generados por el profesor, obteniendo KL 0,0803292 y 90,62% de acuerdo top-1. Los pesos de visión, MTP y speculator quedan excluidos del recuento de tamano, lo que indica que el modelo base incorpora componentes multimodales y de decodificación especulativa que esta cuantización no incluye.

## Capacidades

- Generación de texto y continuación de conversaciones multi-turno, heredadas del modelo base Qwen3.8-27B.
- Razonamiento y capacidades de agente: la model card menciona explícitamente una ronda de destilación sobre "los propios turnos de agente del modelo", lo que implica soporte de comportamiento agéntico en el modelo base.
- Capacidades multimodales (visión) presentes en el modelo base, aunque los pesos de visión están excluidos de esta cuantización.
- Decodificación especulativa en el modelo base (pesos de speculator excluidos del checkpoint).
- Multilingüismo: no disponible en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente para esta cuantización.

## Casos de uso

- Inferencia local en Mac con Apple silicon: el caso de uso principal y único soportado oficialmente. Un desarrollador puede instalar el paquete `mirai` vía Homebrew y ejecutar `mirai --model trymirai/Qwen3.8-27B-S` para tener un modelo de clase 27B comprimido a 95,9 GB de repo corriendo en local sin GPU dedicada.
- Prototipado de agentes en estación de trabajo: gracias a la destilación sobre turnos de agente, el checkpoint conserva comportamiento multi-paso, útil para probar flujos agénticos en local antes de desplegar en infraestructura.
- Evaluación de métodos de cuantización: investigadores pueden usar este checkpoint como referencia para comparar KL y acuerdo top-1 (0,0803292 y 90,62%) frente a otras técnicas de compresión del mismo modelo base.
- Desarrollo de aplicaciones de escritorio con IA integrada: al ejecutarse en Apple silicon sin dependencias de servidor, encaja en apps macOS que requieran generación de texto privada y offline.
- Investigación sobre destilación consciente de cuantización: el pipeline descrito (QTIP + rotaciones Kronecker + QAD) es reproducible y sirve como caso de estudio para trabajar con modelos de muy bajo bit-width.
- Generación de texto asistida en entornos con restricciones de red: al ser un modelo local con licencia Apache 2.0, se puede desplegar en escenarios sin conectividad o con requisitos de confidencialidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Divergencia KL frente al profesor (romakl, 20 conversaciones, 14.456 tokens) | 0,0803292 |
| Acuerdo top-1 con el profesor | 90,62% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única evaluación publicada es la de fidelidad respecto al modelo profesor mediante `romakl`.

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 95,9 GB, por lo que se necesita al menos esa cantidad de memoria unificada disponible para cargar el checkpoint completo.
- Plataforma soportada: exclusivamente Apple silicon (macOS) mediante el runtime `uzu`. No se menciona soporte para CUDA, ROCm ni CPU x86.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas según la información disponible; el autor indica que "currently only Apple silicon inference is supported".
- Cabe en consumer hardware: sí, en equipos Apple silicon con memoria unificada suficiente (el repo de 95,9 GB condiciona el modelo de Mac necesario).
- Opciones de despliegue: CLI `mirai` (Homebrew), runtime `uzu`; compilación desde fuente según la guía del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3.8-27B-S (esta ficha) | 8.682.731.728 en safetensors (base etiquetado 27B) | no disponible | 2-bit / 4-bit mixto (QTIP) | Apache 2.0 | Solo Apple silicon (`uzu`) |
| Qwen/Qwen3.8-27B (modelo base) | 27B (segun denominacion) | no disponible | pesos originales | Apache 2.0 | Ecosistema estandar (no detallado) |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | Apache 2.0 (heredada) | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Plataforma restringida: solo funciona en Apple silicon con el runtime `uzu`; no hay soporte para GPU NVIDIA/AMD ni para servidores Linux estándar, lo que limita su uso en producción convencional.
- Perdida de fidelidad medible: KL 0,0803292 y 90,62% de acuerdo top-1 implican que aproximadamente 1 de cada 10 tokens elegidos por el profesor no coinciden con los del modelo cuantizado; en tareas sensibles esto puede degradar la calidad.
- Componentes excluidos: los pesos de visión, MTP y speculator no están incluidos, por lo que las capacidades multimodales y de decodificación especulativa del modelo base no están disponibles en este checkpoint.
- Falta de información sobre sesgos, alucinación e idiomas: la model card no documenta sesgos conocidos, tasas de alucinación ni cobertura lingüística; se remite a la del modelo base.
- Contexto no documentado: se desconoce la longitud de contexto efectiva de esta cuantización.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base enlazada por el autor antes de desplegar en producción.
- Madurez del ecosistema: el runtime `uzu` y la herramienta `romakl` son proyectos del propio autor, con menor adopción que alternativas como llama.cpp; el soporte y la comunidad pueden ser limitados.
- El recuento de parámetros del checkpoint (8.682.731.728) no coincide con la denominación "27B" del modelo base, por lo que hay que tratar con cautela cualquier estimación de capacidad basada en el nombre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.8-27B-S
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Blog de cuantización de Mirai: https://trymirai.com/blog/quantization
- Herramienta de evaluación romakl: https://github.com/trymirai/romakl/tree/bfb79f548a80b6af7d9f4d4e35d0db99b97708e8
- Runtime uzu (guía de ejecución): https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Runtime Prism (llama.cpp fork usado para evaluar los packings Bonsai 2): https://github.com/PrismML-Eng/llama.cpp/tree/3f035ba664f8f08c3d9432b6421f8f1a0da1f37a
