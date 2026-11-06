# VVladTech/Kandinsky-6.0-Lite-distill-5s-MLX

## Resumen

Kandinsky 6.0 Lite-distill 5s MLX es una conversión comunitaria de los pesos de `kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers` al framework MLX de Apple, publicada por el usuario VVladTech. El modelo original, desarrollado por Kandinsky Lab, es un sistema de generación de vídeo a partir de texto que produce de forma conjunta vídeo y audio sincronizado, una capacidad poco habitual en los modelos text-to-video de código abierto. Esta versión concreta traslada los pesos a MLX para ejecutarlos de forma nativa en Macs con Apple Silicon, con un pipeline propio publicado en un repositorio de GitHub.

Se trata de un modelo de difusión con un transformer (DiT) como componente principal y un VAE para la decodificación de vídeo, destilado para reducir el número de pasos de inferencia (el autor cita 10 pasos PiFlow). El tamaño del repositorio es de 9,1 GB, lo que sitúa los pesos en el rango de los miles de millones de parámetros, aunque la model card no desglosa el conteo exacto. La licencia es MIT tanto para los pesos como para la conversión.

La relevancia de esta ficha es doble: por un lado, documenta una de las primeras implementaciones nativas en MLX de un modelo de vídeo con audio para hardware de Apple; por otro, advierte de que se trata de una versión temprana con capacidades limitadas (solo el tamaño Smoke, sin image-to-video y con el codificador de texto CLIP aún en PyTorch), lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con transformer (DiT) y VAE de vídeo; pipeline MLX nativo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de generación, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en bf16 según los ejemplos; no se documentan cuantizaciones GGUF/INT) |
| Idiomas soportados | no disponible (el prompt de ejemplo está en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (conversión MLX) |

## Arquitectura y entrenamiento

La arquitectura combina un transformer de difusión (DiT) que opera en el espacio latente con un VAE que decodifica los latentes en fotogramas de vídeo, más un componente de audio que genera la pista sonora sincronizada. El modelo original es una versión destilada ("distill") del Kandinsky 6.0 Lite, pensada para reducir el número de pasos de muestreo; el autor de la conversión emplea 10 pasos PiFlow en los ejemplos. El codificador de texto es CLIP y, en esta versión MLX, todavía se ejecuta en PyTorch, lo que impide un flujo completo de prompt a vídeo en un solo comando.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card no los detalla. La innovación destacable es la generación conjunta de vídeo y audio con un formato de prompt que incluye etiquetas `<AUDCAP>` y `<ENDAUDCAP>` para describir la banda sonora, así como la conversión a MLX para Apple Silicon. El estado del proyecto es de lanzamiento temprano: solo funciona de extremo a extremo el tamaño Smoke (256×432, 25 fotogramas, ~1 s), verificado contra diffusers; el tamaño Baseline de 5 s requiere decodificación VAE por teselas y aún no está disponible.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución de 256×432 y 25 fotogramas (~1 s) en el tamaño Smoke.
- Generación de audio sincronizado con el vídeo mediante etiquetas de descripción de audio en el prompt.
- Control detallado de la escena a través de prompts largos y estructurados: iluminación, movimiento de cámara, estado inicial y evolución temporal por intervalos.
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de CUDA.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.
- No se documenta soporte multilingüe explícito; los ejemplos están en inglés.
- No disponible image-to-video en esta versión.

## Casos de uso

- Prototipado rápido de clips publicitarios: el modelo permite generar un vídeo de ~1 s con audio a partir de un prompt detallado de estilo, iluminación y movimiento de cámara, útil para validar conceptos creativos antes de producir con herramientas más costosas.
- Generación de storyboards animados: un equipo de preproducción puede convertir descripciones de escena en clips cortos con sonido ambiente para comunicar la intención de una secuencia.
- Desarrollo y prueba de pipelines MLX: investigadores que trabajan con MLX pueden usar este repositorio como referencia para integrar modelos de difusión de vídeo en aplicaciones de Apple Silicon.
- Creación de contenido para redes sociales: clips de un segundo con audio sincronizado sirven como material base para bucles, transiciones o pruebas de formato en plataformas de vídeo corto.
- Investigación en generación conjunta de vídeo y audio: el formato de prompt con `<AUDCAP>` facilita experimentos sobre coherencia audiovisual en modelos de difusión.
- Demostraciones y material educativo: al ejecutarse en un Mac con Apple Silicon, permite mostrar generación de vídeo en local sin infraestructura de GPU, útil en talleres y clases.
- Evaluación comparativa de ports comunitarios: sirve para medir la fidelidad de la conversión MLX frente a la implementación de diffusers en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que el tamaño Smoke está verificado contra diffusers y que los ejemplos se generaron en un Apple M3 Max de 48 GB con 10 pasos PiFlow, semilla 42 y DiT en bf16, sin cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 9,1 GB, por lo que se requiere memoria unificada suficiente para cargar los pesos más el VAE y el codificador de texto CLIP.
- GPU recomendadas: Apple Silicon; los ejemplos se generaron en un M3 Max con 48 GB de memoria unificada.
- Cabe en GPU consumer: sí, en Macs con Apple Silicon; no se documenta soporte para GPUs NVIDIA o AMD en esta conversión MLX.
- Opciones de despliegue: MLX con el pipeline del repositorio `github.com/vladislav-vasilenko/kandinsky6-mlx`; el codificador de texto CLIP requiere PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución / duración | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky 6.0 Lite-distill 5s MLX | Text-to-video + audio, MLX | 256×432, 25 fotogramas (~1 s) en Smoke | Sí, sincronizado | MIT | Hugging Face, port comunitario |
| Kandinsky 6.0 Lite-distill 5s (Diffusers) | Text-to-video + audio, PyTorch | Hasta 5 s en Baseline (según model card) | Sí, sincronizado | MIT | Hugging Face, oficial |
| Otros modelos text-to-video de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Estado de lanzamiento temprano: solo funciona el tamaño Smoke (256×432, 25 fotogramas, ~1 s); el tamaño Baseline de 5 s no está disponible por requerir decodificación VAE por teselas.
- No soporta image-to-video en esta versión.
- No existe un flujo de un solo comando de prompt a vídeo: el codificador de texto CLIP sigue ejecutándose en PyTorch.
- Es un port comunitario independiente, no una release oficial de Kandinsky Lab; la fidelidad y el mantenimiento dependen del autor.
- Riesgo de alucinación visual y de incoherencias temporales en clips generados, inherente a los modelos de difusión de vídeo; no se documentan evaluaciones al respecto.
- Sesgos conocidos: no documentados en la información disponible; los modelos de difusión de vídeo suelen heredar sesgos de sus datasets de entrenamiento.
- Limitaciones de idioma: no se especifican idiomas soportados; los ejemplos usan prompts en inglés.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones de los pesos base y de las dependencias (CLIP, diffusers) antes de desplegar en producción.
- Requiere hardware Apple Silicon; no es portable a GPUs NVIDIA sin otra conversión.

## Enlaces

- Hugging Face: https://huggingface.co/VVladTech/Kandinsky-6.0-Lite-distill-5s-MLX
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers
- Repositorio del pipeline MLX: https://github.com/vladislav-vasilenko/kandinsky6-mlx
- MLX: https://github.com/ml-explore/mlx
- Informe técnico (arXiv): https://arxiv.org/abs/2610.05608
- Kandinsky Lab: https://kandinskylab.ai/models/video/
