# SZLHOLDINGS/khipu-abstain-v2-trained

## Resumen

khipu-abstain-v2-trained es un adaptador LoRA (QLoRA) desarrollado por SZLHOLDINGS sobre el modelo base Qwen/Qwen2.5-1.5B. Su objetivo declarado no es mejorar las capacidades generales del modelo, sino modificar su comportamiento ante preguntas sin respuesta: entrenar la "abstención", es decir, que el modelo reconozca cuándo no sabe algo y lo declare en lugar de inventar una respuesta. Forma parte de un programa interno del autor denominado "honesty program", orientado a medir y reducir la "confabulación" mediante entrenamiento masivo con currículos específicos.

El adaptador se ha entrenado con QLoRA (r=16, alpha=32, dropout=0.05) sobre los módulos de atención q_proj, k_proj, v_proj y o_proj, durante 200 pasos con un currículo denominado abstention-curriculum-v2. El modelo base Qwen2.5-1.5B es un transformer decoder-only de 1.500 millones de parámetros con una ventana de contexto de 32.768 tokens, pero el adaptador no modifica ni la arquitectura ni el contexto del modelo base.

La relevancia de este modelo es limitada y muy específica: se trata de un piloto de investigación con una evaluación de solo 6 sondas fijas (3 respondibles y 3 no respondibles), en el que el autor reporta una puntuación de 4/6, calificada como "por encima del suelo" con abstención parcial lograda. No es un modelo listo para producción ni un checkpoint completo, sino una pieza dentro de una cadena de experimentos documentada públicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only (Qwen2.5-1.5B) |
| Parámetros totales | no disponible (adaptador LoRA; base de 1.500 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador (el base Qwen2.5-1.5B soporta 32.768 tokens) |
| Tipos de cuantización | no disponible (entrenado en QLoRA con bf16; no se especifican formatos de despliegue) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-1.5B, un transformer decoder-only de la familia Qwen2.5. El método es QLoRA con rango r=16, alpha=32, dropout=0.05 y módulos objetivo q_proj, k_proj, v_proj y o_proj, lo que significa que solo se ajustan las proyecciones de atención, no las capas MLP. El entrenamiento se realizó en bf16 con batch_size=2, grad_accum=4 y learning rate de 2e-4 durante 200 pasos, sobre una única NVIDIA RTX A6000 de 48 GB.

El dato de entrenamiento es el currículo SZLHOLDINGS/abstention-curriculum-v2, cuyo contenido y tamaño no se detallan en la información disponible. No se reporta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La innovación declarada no es arquitectónica sino metodológica: el uso de un currículo específico para mover el "suelo de confabulación" del modelo, medido con una batería fija de sondas. El autor califica explícitamente los 200 pasos como un piloto, no como un entrenamiento completo.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B.
- Abstención parcial ante preguntas no respondibles: según la evaluación del autor, el adaptador declara no saber en parte de los casos en los que el modelo base probablemente confabularía.
- Razonamiento básico y generación de texto en varios idiomas: capacidad heredada del base, aunque no se documenta el alcance multilingüe del adaptador.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- No se documenta ninguna capacidad especial más allá del comportamiento de abstención.

## Casos de uso

- Investigación sobre calibración y abstención: el adaptador sirve como punto de partida para estudiar cómo un currículo específico modifica la tendencia del modelo a declarar ignorancia ante preguntas sin respuesta.
- Experimentos de alineación y honestidad: útil para replicar o contrastar la metodología de medición del "suelo de confabulación" descrita por el autor.
- Prototipado de asistentes que deben declinar responder: en dominios donde una respuesta inventada es costosa (por ejemplo, atención al cliente sobre políticas internas), el adaptador puede probarse como capa de abstención sobre el base de 1.5B, siempre con validación adicional.
- Evaluación comparativa de currículos: al formar parte de una cadena de recibos públicos, permite comparar el efecto de distintos currículos de entrenamiento sobre el mismo modelo base.
- Docencia y demostraciones: ejemplo didáctico de QLoRA con módulos objetivo de atención y de evaluación con sondas fijas.
- Base para fine-tuning posterior: el adaptador puede combinarse con otros adaptadores PEFT o servir de inicialización para experimentos de abstención a mayor escala.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Batería de 6 sondas (3 respondibles + 3 no respondibles), decodificación determinista, 200 tokens máx. | 4/6 |
| Interpretación del autor | "Por encima del suelo": abstención parcial lograda |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica reportada es la puntuación de 4/6 en una batería interna de 6 sondas fijas, que el propio autor reconoce como no exhaustiva.

## Requisitos de hardware

- El adaptador LoRA es pequeño (repo de 0.0 GB según Hugging Face) y se carga junto al modelo base Qwen2.5-1.5B.
- VRAM estimada para el base en bf16: aproximadamente 3 GB de pesos más overhead de activaciones y caché KV; en cuantización de 4 bits, por debajo de 2 GB.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y superiores, con margen amplio.
- GPU de centro de datos: A100, H100, A6000 (la usada en entrenamiento) son suficientes y sobradas para inferencia.
- Opciones de despliegue: el adaptador es PEFT, por lo que se puede cargar con transformers + peft, y fusionar con el base para exportar a GGUF y usar con llama.cpp u Ollama; también es compatible con vLLM y TGI tras la fusión del adaptador.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un modelo de 1.5B en una GPU moderna se espera un throughput alto, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khipu-abstain-v2-trained | Adaptador sobre 1.5B | No disponible (base 32.768) | Abstención vía QLoRA | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B (base) | 1.5B | 32.768 tokens | Modelo generalista | Apache 2.0 | Hugging Face |
| Adaptadores de abstención comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores de abstención directamente comparables ni sobre resultados de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación más directa es con su propio modelo base, del que se diferencia únicamente por el comportamiento de abstención medido en la batería interna.

## Limitaciones y advertencias

- La evaluación se basa en 6 sondas fijas, no en un conjunto exhaustivo; la puntuación 4/6 tiene un valor estadístico muy limitado.
- Es un adaptador LoRA, no un modelo autónomo: requiere cargar Qwen2.5-1.5B y la librería PEFT.
- El entrenamiento de 200 pasos es un piloto declarado por el autor, no un entrenamiento completo; el comportamiento puede ser inestable fuera del conjunto de sondas.
- No se documentan sesgos conocidos, pero al heredar el base Qwen2.5-1.5B arrastra los sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación: el adaptador busca reducirlo, pero la evidencia es parcial (4/6); no hay garantía de abstención correcta en dominios no cubiertos por el currículo.
- No se documentan idiomas soportados ni limitaciones de contexto específicas del adaptador.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base (también Apache 2.0).
- Para producción sería necesario validar el comportamiento de abstención con un conjunto de evaluación propio y representativo del dominio de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/khipu-abstain-v2-trained
- Cadena de recibos (dataset): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Explorador de la cadena: https://szlholdings-szl-receipts-chain.hf.space
- SDK szl en PyPI: https://pypi.org/project/szl/
- Sitio del autor: https://a-11-oy.com
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
