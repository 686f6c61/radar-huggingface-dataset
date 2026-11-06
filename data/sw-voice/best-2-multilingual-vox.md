# sw-voice/best-2-multilingual-vox

## Resumen

best-2-multilingual-vox es un modelo de síntesis de voz (text-to-speech) desarrollado por sw-voice, un fine-tune completo del modelo VoxCPM2 orientado a la síntesis multilingüe de una voz concreta (identificada como "Swamiji") en inglés, telugu y kannada. El modelo parte de sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep y se entrena con el trainer oficial de VoxCPM sobre datos de temáticas reutilizadas en telugu y kannada.

La característica principal es que funciona sin clip de referencia: la identidad vocal está codificada directamente en los pesos, de modo que no es necesario proporcionar audio de referencia en tiempo de inferencia. Con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) y un repositorio de 9,5 GB en formato safetensors, se distribuye bajo licencia Apache 2.0.

Se trata de un modelo de investigación, con solo 19 descargas y sin resultados de benchmarks publicados. Es relevante para quienes exploran fine-tuning de TTS multilingüe con identidad vocal fija y para la comunidad de lenguas indias (telugu y kannada), donde los recursos de TTS de calidad son escasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (modelo base de TTS); detalles internos no disponibles |
| Parametros totales | 2.290.004.544 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, te, kn |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (todos los parámetros entrenados, "nothing frozen") del checkpoint sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep, realizado con el trainer oficial de VoxCPM. La arquitectura subyacente es VoxCPM2, un sistema de TTS; la model card no detalla la topología interna (transformer, difusión, flow matching, etc.), aunque el proceso de entrenamiento menciona flow-matching con t = sigmoid(N(1.0, 1)), lo que sugiere un componente generativo basado en flow matching para la síntesis de audio.

Los datos de entrenamiento provienen de sw-voice/swamiji-navaratri-telugu-reuse-themes y sw-voice/swamiji-navaratri-kannada-reuse-themes, con 127 y 124 unidades temáticas completas respectivamente, en modalidad RE-USE. La configuración de entrenamiento fue: micro-batch 1 con acumulación de 8, 5 épocas (160 pasos totales), learning rate 0,0001 con schedule coseno, warmup de 24 pasos y grad clip de 1,0. El modelo es reference-free: la voz objetivo reside en los pesos y no requiere audio de referencia en inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada.
- Identidad vocal fija y consistente sin necesidad de clip de referencia.
- Generación de audio a partir de texto en los tres idiomas soportados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se documentan modos especiales (thinking mode, clonación de voz arbitraria, control de emoción o prosodia).

## Casos de uso

- Síntesis de contenido religioso o devocional en telugu y kannada: el modelo está entrenado sobre temáticas de Navaratri y reproduce una voz concreta, adecuado para narrar textos devocionales sin disponer de grabaciones de referencia.
- Audiolibros y narración multilingüe: permite generar la misma voz en inglés, telugu y kannada, útil para publicaciones que necesitan coherencia vocal entre idiomas.
- Accesibilidad para lectores de pantalla en lenguas indias: integrable en pipelines de TTS para convertir texto en audio en telugu y kannada, idiomas con menor cobertura de voces sintéticas de calidad.
- Generación de material educativo en varios idiomas: un mismo narrador sintético para cursos en inglés y lenguas del sur de la India, reduciendo la necesidad de múltiples grabaciones.
- Prototipado de asistentes de voz regionales: al ser reference-free, simplifica el despliegue en producción al eliminar la gestión de clips de referencia.
- Investigación en fine-tuning de TTS: sirve como punto de partida reproducible (configuración y datos documentados) para experimentos de adaptación de voz en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2,29 mil millones de parámetros, en fp16 se requieren aproximadamente 4,6 GB solo para pesos, más memoria para activaciones y buffers de audio.
- GPU recomendadas: no disponible; por tamaño, cabría esperar funcionamiento en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB) y en A100/H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: probable en fp16 con 8-12 GB de VRAM o más, aunque no está confirmado por el autor.
- Opciones de despliegue: no se documentan (no se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de audio, estos runners no son aplicables directamente). El autor referencia el código en swamiji-tts, ruta research/exp-iterations/06-voxcpm2-swamiji-stages.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| best-2-multilingual-vox | 2,29 B | no disponible | en, te, kn | Apache 2.0 | Fine-tune de VoxCPM2, reference-free |
| best-2-multilingual-maya (sw-voice) | no disponible | no disponible | no disponible | no disponible | Modelo hermano seleccionado el mismo dia |
| voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep | no disponible | no disponible | no disponible | no disponible | Modelo base del que parte este fine-tune |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo etiquetado como de investigación; no hay evidencia de validación en producción.
- Solo tres idiomas (inglés, telugu, kannada); no se documenta cobertura de otros idiomas.
- Identidad vocal fija: no permite clonar voces arbitrarias ni cambiar de hablante.
- Riesgo de alucinación o artefactos en la síntesis de audio, especialmente en textos fuera del dominio de entrenamiento (temáticas de Navaratri).
- Dataset de entrenamiento muy pequeño (127 y 124 unidades temáticas) y solo 160 pasos de entrenamiento, lo que limita la generalización.
- Sin benchmarks publicados: no es posible evaluar calidad objetiva (MOS, WER, similitud de hablante).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no detalladas en la model card.
- Sin información sobre sesgos, latencia ni requisitos de hardware verificados.

## Enlaces

- Hugging Face: https://huggingface.co/sw-voice/best-2-multilingual-vox
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep
- Modelo hermano: https://huggingface.co/sw-voice/best-2-multilingual-maya
- Dataset telugu: sw-voice/swamiji-navaratri-telugu-reuse-themes
- Dataset kannada: sw-voice/swamiji-navaratri-kannada-reuse-themes
- Codigo: swamiji-tts, ruta research/exp-iterations/06-voxcpm2-swamiji-stages (sin URL directa disponible)
