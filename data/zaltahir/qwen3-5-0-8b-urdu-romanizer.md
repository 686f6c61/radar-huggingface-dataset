# zaltahir/qwen3.5-0.8b-urdu-romanizer

## Resumen

Qwen3.5-0.8B Urdu → Roman Urdu romanizer es un ajuste fino por LoRA del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario zaltahir en Hugging Face. Su única tarea es la transliteración: convierte texto en urdu escrito en grafía perso-árabe a roman urdu, es decir, urdu escrito con letras latinas tal y como lo teclean habitualmente los hablantes de Pakistán. No es un modelo conversacional generalista, sino una herramienta especializada de un solo paso.

El modelo resuelve un problema muy concreto: el roman urdu carece de ortografía estándar y los modelos multilingües genéricos lo generan de forma muy deficiente. Según la model card, el Qwen3.5-0.8B sin ajustar obtiene un 84,0 % de CER y un 102,4 % de WER en el conjunto de test Dakshina, mientras que este ajuste baja a 13,5 % de CER y 40,9 % de WER. Con solo 752 millones de parámetros, supera en chrF (69,2) y se acerca en char-BLEU (76,2) a sistemas mucho mayores como GPT-4o mini en modo zero-shot.

Es relevante ahora por dos motivos: demuestra que un ajuste LoRA pequeño y barato (entrenado en una única RTX 5060 Ti de 16 GB) puede resolver una tarea lingüística de nicho mejor que modelos de frontera, y porque el propio autor lo concibe como generador de etiquetas de entrenamiento para un sistema de reconocimiento de voz en urdu.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tipo `qwen3_5_text`), ajuste LoRA fusionado en los pesos |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el modelo base admite cuantizaciones estándar de la familia Qwen) |
| Idiomas soportados | urdu (entrada en perso-árabe, salida en roman urdu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 con 752 millones de parámetros. Sobre él se aplicó un ajuste fino con LoRA de rango 64 sobre todas las capas lineales, y los adaptadores se fusionaron posteriormente en los pesos finales, de modo que el repositorio contiene un modelo denso estándar cargable con `AutoModelForCausalLM`, sin necesidad de cargar adaptadores por separado.

El entrenamiento usó 50.000 pares del dataset zaltahir/roman-urdu-parl-clean, durante 1 época, con tasa de aprendizaje 0,0002 y 64 frases por actualización, en una sola GPU RTX 5060 Ti de 16 GB. No se documentan fases de RLHF ni DPO; es un ajuste supervisado de transliteración. La innovación técnica principal es de bajo coste: demuestra que un LoRA de rango moderado sobre un modelo de 0,8B basta para una tarea de transliteración con errores de un dígito en CER. El prompt de inferencia es fijo y debe reproducirse exactamente tal y como aparece en la model card, con `enable_thinking=False`.

## Capacidades

- Transliteración urdu (perso-árabe) → roman urdu, con salida en una sola línea de texto latino.
- Manejo de frases largas: el conjunto de evaluación incluye oraciones de hasta 80 palabras.
- Generación determinista recomendada (`do_sample=False`), adecuada para tareas de etiquetado.
- No es un modelo conversacional: no está pensado para diálogo abierto ni multi-turno.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de pensamiento (el propio prompt lo desactiva).
- Capacidad multilingüe limitada al par urdu/roman urdu; no se reportan otros idiomas.

## Casos de uso

- Generación de etiquetas para ASR en urdu: el autor lo diseñó explícitamente como ayuda para producir etiquetas en roman urdu de un modelo de reconocimiento de voz en urdu, aprovechando su bajo CER (13,5 %) para alinear transcripciones.
- Normalización de corpus para NLP en roman urdu: convertir grandes volúmenes de texto en perso-árabe a grafía latina antes de entrenar modelos de clasificación, análisis de sentimiento o topic modeling sobre texto que los usuarios escriben en redes sociales.
- Preprocesado de datos para entrenamiento de chatbots: transformar pares urdu/roman urdu del dataset Parl para construir datasets de instrucciones bilingües.
- Moderación de contenido en foros y redes: transliterar mensajes en urdu a caracteres latinos para aplicar pipelines de filtrado y clasificación que solo operan sobre alfabeto latino.
- Búsqueda y recuperación de información: indexar documentos en urdu junto a su versión romanizada para permitir consultas en roman urdu sobre corpus originalmente en perso-árabe.
- Herramienta de escritorio o extensión para usuarios: convertir texto urdu pegado a roman urdu de forma local, dado que el modelo de 0,8B cabe en GPU de consumo y puede ejecutarse en un portátil con GPU de 8 GB o más.

## Benchmarks y rendimiento

Conjunto de test: Dakshina Urdu, 4.844 frases romanizadas por hablantes nativos (hasta 80 palabras), no vistas en entrenamiento. Puntuaciones tras pasar a minúsculas y eliminar puntuación.

| Modelo | CER ↓ | WER ↓ | char-BLEU ↑ | chrF ↑ |
|---|---|---|---|---|
| Qwen3.5-0.8B sin ajustar (mismo prompt) | 84,0 % | 102,4 % | 2,3 | 2,1 |
| GPT-4o mini, zero-shot * | — | — | 75,1 | 68,0 |
| m2m100 entrenado con Roman-Urdu-Parl * | — | — | 68,7 | 61,8 |
| m2m100 entrenado con Roman-Urdu-Parl + Dakshina * | — | — | 78,5 | — |
| Este modelo (0,8B, 50k pares) | 13,5 % | 40,9 % | 76,2 | 69,2 |

\* Filas reportadas en arXiv 2503.21530, no reejecutadas por el autor; el split de test y la normalización de texto de ese paper pueden diferir (lista un test de 500 frases), por lo que deben tomarse como indicativas. El guion "—" indica dato no reportado.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,5 GB de pesos, más overhead de activaciones; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: RTX 3060/4060/5060 Ti y superiores para uso local; A100 o H100 no son necesarias, pero permiten mayor throughput por batching.
- Cabe en GPU de consumo: sí, incluso en modelos con 8 GB de VRAM; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` 5.x (requisito explícito para soporte de Qwen3.5), `vLLM` y `TGI` para servir en producción, y `llama.cpp`/`Ollama` si se generan pesos GGUF a partir del modelo base y los pesos fusionados (no se distribuyen GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (Dakshina) | chrF | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Qwen3.5-0.8B + LoRA) | 752 M | no disponible | 13,5 % | 69,2 | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B sin ajustar | 752 M | no disponible | 84,0 % | 2,1 | Apache 2.0 | Hugging Face |
| m2m100 (Parl + Dakshina) | no disponible | no disponible | no disponible | no disponible | no disponible | paper arXiv 2503.21530 |
| GPT-4o mini (zero-shot) | no disponible | no disponible | no disponible | 68,0 | propietaria | API de OpenAI |

La comparación es asimétrica: los dos primeros son modelos abiertos y los dos últimos, referencias del paper o de un servicio propietario. En términos de licencia y despliegue local, este modelo es la opción más accesible de la tabla.

## Limitaciones y advertencias

- Ortografía no normalizada: el modelo se entrenó con una mezcla de noticias, Wikipedia, poesía y foros, por lo que su romanización sigue esa mezcla y no un estándar único (por ejemplo, "nahi" frente a "nahin").
- Errores frecuentes en nombres propios poco comunes y préstamos lingüísticos.
- El WER del 40,9 % indica que, aunque el CER sea bajo, las palabras completas pueden diferir; no debe usarse como transcripción exacta sin revisión.
- El prompt de inferencia es fijo y debe respetarse; desviarse de él puede degradar la calidad de forma significativa.
- Requiere `transformers` 5.x; versiones anteriores no cargan la arquitectura Qwen3.5.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la calidad en dominios distintos al corpus de entrenamiento.
- Riesgo de alucinación en entradas ambiguas o fuera de dominio: al ser un modelo generativo, puede producir una romanización plausible pero incorrecta en lugar de señalar el error.
- No está diseñado para diálogo, razonamiento ni otras tareas; usarlo fuera de la transliteración dará resultados no fiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zaltahir/qwen3.5-0.8b-urdu-romanizer
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/zaltahir/roman-urdu-parl-clean
- Paper de referencia: https://arxiv.org/abs/2503.21530
- Dataset Dakshina: https://github.com/google-research-datasets/dakshina
