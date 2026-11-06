# sw-voice/maya-named-pitch-ablation-a-lrmult-1-2-1-0.5

## Resumen

maya-named-pitch-ablation-a-lrmult-1-2-1-0.5 es un ajuste fino completo (full fine-tune) del modelo de síntesis de voz maya-research/maya2-native, desarrollado por el usuario sw-voice dentro de la organización maya-research. Se trata de un experimento de investigación orientado a clonar la voz de un hablante concreto identificado como "Swamiji" mediante un mecanismo de voz nombrada (named voice) que no requiere clip de referencia en tiempo de inferencia. El modelo resuelve el problema de la personalización de TTS sin necesidad de audio de referencia, codificando la identidad vocal en un identificador textual.

La relevancia de esta ficha es limitada: se trata de un artefacto de ablación con fines de investigación, no de un modelo de producción. El nombre del repositorio codifica los hiperparámetros del experimento (multiplicadores de learning rate 1,2,1,0.5 sobre los distintos componentes del modelo) y la variante "A" de una serie de ablaciones de prosodia. Con 2.502.398.656 parámetros y un tamaño de repositorio de 5,0 GB en safetensors, es un modelo de escala media que probablemente no cabe en GPUs de consumo convencionales sin cuantización.

La información pública disponible es muy escasa: cero descargas, cero likes, sin resultados de benchmarks, sin especificación de idiomas soportados más allá de la mención de datos en inglés, telugu y kannada, y sin documentación sobre la arquitectura interna del modelo base. Esta ficha refleja fielmente esa limitación y marca como "no disponible" todo aquello que la model card no especifica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base maya2-native; pipeline text-to-speech) |
| Parámetros totales | 2.502.398.656 (~2,5 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible oficialmente; datos de entrenamiento en inglés, telugu y kannada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base maya-research/maya2-native en la documentación proporcionada. El pipeline declarado es text-to-speech, lo que sitúa al modelo en la categoría de sistemas TTS neuronales, pero no se especifica si emplea un transformer autorregresivo, un modelo de difusión, un esquema híbrido acústico-vocoder o alguna otra variante. Tampoco se detalla la longitud de contexto ni la representación acústica utilizada.

El entrenamiento es un ajuste fino completo sobre el modelo base con los siguientes hiperparámetros documentados: learning rate de 5e-06, 3 épocas equivalentes a 552 actualizaciones, batch de 1x8, warmup lineal de 138 actualizaciones seguido de tasa constante, y multiplicadores de learning rate por componente de 1, 2, 1 y 0,5 (ablación A de prosodia). Los datos consisten en 719 clips en inglés más temas de Navaratri en telugu y kannada repetidos tres veces cada uno (clips_te.pt*3 y clips_kn.pt*3), con la voz nombrada "{Swamiji}". La repetición FILE*N indica filas repetidas N veces por época, una técnica de sobremuestreo para compensar el desbalance entre idiomas. No se menciona RLHF, DPO ni ninguna otra fase de alineación.

La innovación técnica destacable es el mecanismo de voz nombrada sin clip de referencia: el prompt se construye como "{Swamiji}: <texto>" y la identidad vocal se resuelve cargando voices/voices.json mediante Maya3TTS.from_pretrained(...) y llamando a generate(text, voice="Swamiji"). Esto elimina la necesidad de audio de referencia en inferencia, a diferencia de los esquemas de clonación zero-shot convencionales.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Clonación de voz mediante identificador nombrado ("Swamiji") sin clip de referencia en tiempo de inferencia.
- Soporte multilingüe limitado a los idiomas presentes en los datos de entrenamiento: inglés, telugu y kannada.
- Generación condicionada por prompt con formato "{nombre_voz}: <texto>".
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio de entrada.
- No se documentan capacidades de control de prosodia más allá de la ablación experimental que da nombre al modelo.

## Casos de uso

- Investigación en clonación de voz sin referencia: el modelo permite estudiar cómo se codifica la identidad vocal en un identificador textual y comparar variantes de ablación de prosodia con los mismos datos, gracias a los multiplicadores de learning rate diferenciados por componente.
- Evaluación de técnicas de sobremuestreo multilingüe: la receta con repetición FILE*3 para telugu y kannada sirve para analizar el efecto del balanceo de datos en un TTS multilingüe con recursos escasos.
- Reproducción de experimentos de ajuste fino: los hiperparámetros documentados (LR 5e-06, 552 actualizaciones, warmup 138, batch 1x8) permiten replicar el entrenamiento con el código swamiji-tts en research/maya2-sft.
- Generación de audio para un hablante concreto en prototipos internos: la API generate(text, voice="Swamiji") simplifica la integración en demos sin gestionar clips de referencia.
- Estudio de prosodia controlada: la variante de ablación A con multiplicadores 1,2,1,0,5 sobre los componentes del modelo permite aislar qué módulo afecta más a la prosodia del habla generada.
- Base para futuros ajustes: al ser un full fine-tune con licencia Apache 2.0, puede servir como punto de partida para experimentos posteriores sobre el mismo hablante o sobre otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP32): aproximadamente 10 GB solo para pesos (2,5 B × 4 bytes), más overhead de activaciones y vocoder.
- VRAM estimada en FP16/BF16: aproximadamente 5 GB para pesos, más overhead; viable en GPUs de 8-12 GB según el resto del pipeline.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2,5-3 GB para pesos, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: no disponible en la documentación; por tamaño, cabría esperar A100, H100, L40S o RTX 4090 para inferencia en FP16.
- Cabe en GPU de consumo: probablemente sí en RTX 3090/4090 (24 GB) en FP16; en GPUs de 8 GB requeriría cuantización no publicada.
- Opciones de despliegue: no se documentan; la model card solo menciona la API Python Maya3TTS.from_pretrained(...). No hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS con voz nombrada) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación: el nombre del repositorio indica una ablación experimental, no un modelo validado para producción.
- Sin métricas publicadas: no hay benchmarks de calidad de audio (MOS, WER, similitud de hablante) que permitan evaluar su rendimiento real.
- Idiomas no declarados oficialmente: aunque los datos incluyen inglés, telugu y kannada, la model card no especifica la cobertura lingüística efectiva ni la calidad por idioma.
- Riesgo de alucinación acústica y artefactos: al ser un TTS ajustado con pocos datos (719 clips en inglés más repeticiones), es probable que generalice mal fuera del dominio de entrenamiento.
- Sesgos del hablante: la voz está sobreajustada a "Swamiji"; no se documentan sesgos de género, acento o registro.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base maya2-native y los datos de voz pueden tener condiciones adicionales no reflejadas en la model card; conviene verificar la licencia del modelo base antes de un uso comercial.
- Sin soporte documentado de cuantización ni de motores de inferencia estándar, lo que dificulta el despliegue en producción.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/maya-named-pitch-ablation-a-lrmult-1-2-1-0.5
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Código de entrenamiento (referenciado en la model card): repositorio swamiji-tts, directorio research/maya2-sft (no se proporciona URL directa)
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información disponible.
