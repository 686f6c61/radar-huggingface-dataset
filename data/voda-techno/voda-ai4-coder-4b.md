# VoDa-Techno/VoDa-AI4-Coder-4b

## Resumen

VoDa-AI4-Coder-4b es un modelo de generación de texto especializado en programación y tareas de IT, publicado por VoDa-Techno bajo la marca "ВоДа АИ" (VoDa AI). Según su model card, se trata de una edición derivada de la familia Qwen, reempaquetada y ajustada para escritura, refactorización, depuración y explicación de código, con soporte nativo de ruso e inglés. El autor lo posiciona como la variante ligera de una familia que incluye también versiones de 9B y 27B, además de una línea "Lite" de propósito general.

El dato más relevante y a la vez más problemático es la discrepancia entre el tamaño anunciado y el real: el nombre del modelo y el model card hablan de "4b" (4 mil millones de parámetros), pero los pesos en formato safetensors del repositorio suman 333.514.240 parámetros, es decir, aproximadamente 0,33B. Esta inconsistencia debe tenerse en cuenta antes de cualquier evaluación: o el repositorio contiene un checkpoint truncado o destilado, o el etiquetado comercial no se corresponde con el contenido publicado.

La relevancia del modelo es limitada y de nicho: apunta a despliegue en hardware muy modesto (portátil, GPU de consumo) mediante GGUF Q4 y Ollama, e incluye integración declarada con una herramienta propia llamada "DeepSeek Harness" para acceso a ficheros, terminal y búsqueda web. No hay métricas publicadas, el repositorio no registra descargas ni interacciones y la licencia es "other" sin texto visible, lo que exige precaución en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen, según model card; detalles no disponibles) |
| Parametros totales | 333.514.240 (según safetensors); el nombre y el model card indican "4B" |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4 (único formato declarado en el model card) |
| Idiomas soportados | ruso, inglés |
| Licencia | other (licencia propia "VoDa AI"; texto no disponible en la información proporcionada) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El model card describe el modelo como una "coder-model" construida a partir de Qwen, sin especificar la variante concreta de la que deriva ni el proceso de ajuste aplicado. No se detalla si hubo fine-tuning supervisado, RLHF, DPO ni qué volumen de tokens de código se utilizó. Tampoco se indica la composición del dataset de entrenamiento, la longitud de contexto nativa ni si se aplicaron técnicas de atención lineal, decodificación especulativa u otras optimizaciones de inferencia.

La única información técnica concreta disponible es el recuento de parámetros de los pesos safetensors (333,5 millones) y el formato de publicación (GGUF Q4 para Ollama). La etiqueta "qwen" en los tags sugiere herencia del tokenizador o de la arquitectura base de Qwen, pero no hay confirmación documental de qué checkpoint sirvió de punto de partida ni de las modificaciones realizadas. Cualquier afirmación sobre innovaciones técnicas sería especulativa y no se incluye.

## Capacidades

- Generación de código: escritura, refactorización, depuración y explicación de fragmentos, según el model card.
- Tareas de IT generales: el autor la describe como especializada en "código y tareas de IT".
- Bilingüe ruso-inglés: declarada como "totalmente rusohablante" y angloparlante.
- Integración con herramientas: el model card menciona conexión con "DeepSeek Harness" para acceso a ficheros, terminal y búsqueda en internet, lo que implica soporte de algún esquema de tool calling o agentes, aunque no se documenta el formato.
- Ejecución local ligera: orientada a portátiles y hardware débil, con formato GGUF Q4.
- No se declaran capacidades de visión, audio, modo "thinking" explícito ni razonamiento multi-paso formalizado.

## Casos de uso

- Autocompletado y generación de código en el editor: con un peso de ~0,33B en Q4, el modelo puede ejecutarse en CPU o GPU integrada y ofrecer sugerencias de baja latencia en entornos con recursos limitados, aunque la calidad esperable es la de un modelo pequeño.
- Asistente de refactorización en local: para renombrar, extraer funciones o simplificar bloques en proyectos personales, sin enviar código a servicios externos, aprovechando el despliegue vía Ollama.
- Explicación de código para desarrolladores rusohablantes: el soporte nativo de ruso permite generar documentación y comentarios técnicos en ese idioma, un nicho poco cubierto por modelos pequeños occidentales.
- Automatización de tareas de terminal en un agente: la integración declarada con "DeepSeek Harness" permitiría encadenar lectura de ficheros, ejecución de comandos y búsqueda web en flujos autónomos sencillos, siempre con supervisión humana.
- Prototipado educativo: para enseñar conceptos de despliegue de LLM (GGUF, Ollama, cuantización) en equipos de estudiantes sin GPU dedicada.
- Filtrado y clasificación de fragmentos de código: tareas de etiquetado o detección de errores simples en pipelines de CI, donde el coste computacional importa más que la precisión máxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con ~0,33B parámetros en Q4, la huella de pesos ronda los 200-250 MB; en FP16 serían ~670 MB. La inferencia completa cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) ejecuta el modelo sin problemas; también es viable en CPU y en GPU integrada.
- Cabe en GPU de consumo: sí, en todas las gamas actuales, e incluso en dispositivos de gama baja.
- Opciones de despliegue: Ollama (método indicado por el autor), llama.cpp para GGUF; vLLM y TGI requerirían conversión y no están documentados para este checkpoint.
- Latencia y throughput: no disponibles. Por el tamaño, se espera latencia muy baja en hardware de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoDa-AI4-Coder-4b | 333,5M (declarado 4B) | no disponible | ru, en | other (propia) | Hugging Face, Ollama |
| Qwen2.5-Coder-0.5B | 0,5B | 32K (según documentación pública de Qwen) | multilingüe | Apache 2.0 | Hugging Face, Ollama |
| Qwen2.5-Coder-1.5B | 1,5B | 32K (según documentación pública de Qwen) | multilingüe | Apache 2.0 | Hugging Face, Ollama |
| DeepSeek-Coder-1.3B | 1,3B | 16K (según documentación pública de DeepSeek) | en (principalmente) | DeepSeek License | Hugging Face |

La comparación es aproximada: los datos de contexto y licencia de los modelos alternativos provienen de su documentación pública y no de la información proporcionada para este modelo. VoDa-AI4-Coder-4b destaca únicamente por su soporte declarado de ruso y su licencia propia, frente a las licencias permisivas (Apache 2.0) de las alternativas de Qwen.

## Limitaciones y advertencias

- Discrepancia crítica de tamaño: el nombre y el model card indican 4B, pero los pesos publicados suman 333,5M parámetros. Verificar el contenido real del repositorio antes de usarlo.
- Licencia "other" sin texto accesible: no se puede confirmar si el uso comercial está permitido; el model card remite a un fichero LICENSE no incluido en la información disponible.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en código, matemáticas o razonamiento.
- Riesgo elevado de alucinación en APIs y sintaxis: los modelos de este tamaño y sin evaluación publicada tienden a inventar funciones y librerías.
- Contexto no documentado: se desconoce la ventana máxima, lo que impide planificar tareas con ficheros grandes.
- Repositorio sin tracción: cero descargas y cero "likes" en el momento de la consulta, lo que reduce la probabilidad de que los errores hayan sido detectados por la comunidad.
- Integración con "DeepSeek Harness": herramienta no estándar y no verificada; la afirmación de acceso a terminal y búsqueda web debe validarse de forma independiente.
- Idiomas limitados a ruso e inglés: el castellano no está declarado como soportado.

## Enlaces

- Hugging Face: https://huggingface.co/VoDa-Techno/VoDa-AI4-Coder-4b
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos del autor.
