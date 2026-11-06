# Zeyad/allam-7b-saudi-sft

## Resumen

Zeyad/allam-7b-saudi-sft es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base humain-ai/ALLaM-7B-Instruct-preview, un transformer decoder-only de 7.000 millones de parametros desarrollado originalmente por el equipo de ALLaM (Humain AI / SDAIA). El adaptador está orientado a generar respuestas en árabe a publicaciones y comentarios de redes sociales en árabe, inglés o lengua mixta, con un sesgo específico hacia el registro y las convenciones comunicativas de Arabia Saudí.

El modelo no es un artefacto autónomo: se distribuye como pesos PEFT (LoRA) que requieren cargar los pesos base de ALLaM-7B-Instruct-preview en la revisión fijada `a28dd1e67420cde72d3629c8633a974cf7d9c366` y envolverlos con `PeftModel.from_pretrained`. El repositorio ocupa aproximadamente 0,2 GB, lo que corresponde únicamente a los pesos del adaptador y no al modelo completo.

Su relevancia es acotada y de carácter investigador: explora la adaptación cultural y dialectal de un LLM árabe mediante QLoRA sobre un corpus curado de un único foro de Reddit. El autor declara explícitamente que no se han evaluado la retención de capacidades generales ni la calidad social frente al modelo base con métricas ciegas, por lo que debe tratarse como un experimento reproducible y no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base ALLaM-7B-Instruct-preview) con adaptador LoRA/PEFT |
| Parametros totales | 7.000 millones (modelo base); adaptador LoRA de rango 16 (tamaño exacto del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento usó secuencias de 2048 tokens |
| Tipos de cuantizacion | Entrenado con QLoRA NF4; cuantizaciones de inferencia del adaptador no especificadas |
| Idiomas soportados | Árabe (ar) e inglés (en), con énfasis en árabe saudí y texto mixto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 7B parámetros con atención causal estándar (la arquitectura interna detallada de ALLaM-7B-Instruct-preview no se especifica en la información disponible). El ajuste se realizó con QLoRA en precisión NF4, rango 16, alpha 32, dropout 0,05, learning rate 5e-05, un máximo de 1,0 época y longitud máxima de secuencia de 2048 tokens. Se usó pérdida media por ejemplo sobre los tokens de respuesta, microbatch 1 con acumulación de gradiente 16 y sin packing.

El corpus de entrenamiento consta de 5.630 ejemplos de entrenamiento, 736 de validación y 695 de test, compuestos por pares de publicación y comentario extraídos de redes sociales. La selección aplicó exclusiones manuales y un límite de 5 comentarios por publicación ordenados por número de likes. Para evitar filtración de datos, los comentarios de una misma publicación original y las peticiones con duplicados léxicos detectados se mantuvieron en el mismo split. No se reporta el número total de tokens de entrenamiento ni la composición lingüística exacta del dataset.

La innovación técnica es limitada: se trata de una adaptación de dominio/registro mediante LoRA, no de una arquitectura nueva. El autor proporciona un `training_recipe.json` y un `environment.txt` para reproducibilidad, e indica que el prompt de sistema y la plantilla nativa de ALLaM deben tomarse de ese recetario.

## Capacidades

- Generación de texto conversacional en árabe, inglés y código mixto árabe-inglés.
- Redacción de respuestas a publicaciones y comentarios de redes sociales con registro informal y sesgo hacia convenciones saudíes.
- Conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Adaptación dialectal orientada a Arabia Saudí (no verificada como representativa de todos los dialectos).
- Capacidades heredadas del modelo base ALLaM-7B-Instruct-preview (razonamiento, código, matemáticas) no evaluadas tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Moderación y respuesta asistida en comunidades árabes de redes sociales: el adaptador se entrenó sobre pares publicación/comentario de un foro, por lo que puede generar respuestas contextuales a comentarios existentes en árabe o texto mixto.
- Generación de borradores de respuesta para community managers saudíes: dado un post en árabe o mezcla árabe-inglés, el modelo produce un comentario candidato que un humano revisa antes de publicar.
- Investigación sobre adaptación dialectal: sirve como punto de partida reproducible (recetario y entorno incluidos) para estudiar cómo el ajuste LoRA sobre un corpus pequeño desplaza el registro del modelo base.
- Clasificación y enriquecimiento de hilos de discusión: combinado con prompts de sistema, puede resumir o reformular comentarios de un hilo manteniendo el registro informal.
- Prototipado de asistentes conversacionales en árabe saudí: útil en fases de exploración de producto donde se necesita un tono local antes de invertir en un ajuste a mayor escala.
- Evaluación comparativa de adaptadores LoRA: al requerir el modelo base fijado por revisión, permite reproducir experimentos controlados de SFT sobre ALLaM-7B sin reentrenar desde cero.
- Generación de texto bilingüe árabe-inglés en entornos educativos o de contenido: para borradores de publicaciones y respuestas en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la selección de checkpoint se basó únicamente en la pérdida de validación, que se incluye una revisión ciega baseline-versus-adaptador en el cuaderno de entrenamiento, y que no se reclama ninguna mejora de win-rate humano ni de benchmark.

## Requisitos de hardware

- El adaptador por sí solo no es inferible: requiere cargar los pesos completos de ALLaM-7B-Instruct-preview (aproximadamente 14 GB en FP16/BF16) más el adaptador LoRA (~0,2 GB en el repositorio).
- VRAM estimada para inferencia en BF16/FP16: en torno a 16-18 GB incluyendo overhead de contexto; en cuantización de 4 bits (NF4/GPTQ/AWQ sobre el base) podría situarse en el rango de 6-8 GB, aunque no se proporcionan cuantizaciones oficiales del adaptador.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4080 (16-24 GB) para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en BF16 y en GPUs de 8-12 GB si se cuantiza el modelo base a 4 bits.
- Opciones de despliegue: transformers + PEFT (ruta oficial documentada), vLLM y TGI tras fusionar el adaptador con el base, llama.cpp/Ollama solo si se genera un GGUF fusionado (no incluido).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeyad/allam-7b-saudi-sft | 7B (base) + LoRA r16 | no disponible | SFT dialectal saudí sobre ALLaM | Apache 2.0 | Adaptador PEFT en Hugging Face |
| humain-ai/ALLaM-7B-Instruct-preview | 7B | no disponible | LLM árabe-inglés instruction-tuned | no disponible en la información | Pesos completos en Hugging Face |
| Jais-13B / Jais-family (Inception/G42/Core42) | 13B | 2048 (versiones iniciales) | LLM árabe-inglés | Apache 2.0 (family) | Pesos completos en Hugging Face |
| AceGPT-7B / 13B (FreedomIntelligence) | 7B/13B | 4096 | LLM árabe con adaptación cultural | Apache 2.0 | Pesos completos en Hugging Face |

La comparación es orientativa: el adaptador de Zeyad no es directamente equivalente a un modelo completo, ya que depende del base ALLaM y no se han publicado métricas que permitan situarlo frente a Jais o AceGPT en tareas estándar.

## Limitaciones y advertencias

- El corpus se concentra en una única comunidad de Reddit; la identidad saudí de los autores no está verificada.
- No se ha establecido que el adaptador sea representativo de todos los dialectos o poblaciones saudíes.
- Puede alucinar o imitar afirmaciones personales presentes en los datos de entrenamiento.
- La retención multilingüe y de razonamiento general no se ha evaluado tras el ajuste; puede degradarse respecto al base.
- No es un sistema de asesoramiento profesional (médico, legal, financiero).
- La selección por pérdida de validación no demuestra mejora en calidad social ni en representatividad cultural.
- No se incluyen las filas crudas de entrenamiento y evaluación en el repositorio, lo que limita la auditoría externa del dataset.
- El adaptador no es un modelo fusionado autónomo: requiere los pesos base en la revisión exacta indicada; usar otra revisión puede romper la compatibilidad.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial debe verificar también la licencia de los pesos base ALLaM-7B-Instruct-preview, no disponible en la información proporcionada.
- Riesgo de sesgos derivados del foro de origen (sesgo de autoselección, temas y demografía de Reddit).

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Zeyad/allam-7b-saudi-sft
- Modelo base: https://huggingface.co/humain-ai/ALLaM-7B-Instruct-preview
- Revisión fijada del base: `a28dd1e67420cde72d3629c8633a974cf7d9c366`
- Recetario de entrenamiento: `training_recipe.json` (incluido en el repositorio)
- Entorno de reproducción: `environment.txt` (incluido en el repositorio)
- Cuaderno de entrenamiento con revisión ciega baseline-versus-adaptador: referenciado en la model card (no se proporciona URL directa en la información disponible)
