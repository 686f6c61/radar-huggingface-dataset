# sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-navaratri-only-lr1e-6-17ep

## Resumen

qwen3-tts-12hz-1.7b-swamiji-te-navaratri-only-lr1e-6-17ep es un modelo de síntesis de voz (text-to-speech) derivado de la familia Qwen3-TTS, publicado por el usuario sw-voice en Hugging Face. Se trata de un ajuste fino completo (full fine-tune) del modelo sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep, que a su vez parte de una base Qwen3-TTS de 1,7 mil millones de parámetros con tokenizador de audio a 12 Hz. El modelo está especializado exclusivamente en telugu (código de idioma `te`) y en una única voz de referencia denominada "swamiji".

El problema que resuelve es muy acotado: generar locuciones en telugu con la identidad vocal de un hablante concreto (Swamiji) sobre textos temáticos de Navaratri. El entrenamiento se realizó sobre un corpus de reutilización de 127 unidades (1,83 horas) extraído de sw-voice/swamiji-navaratri-telugu-reuse-themes, durante 17 épocas completas. No se trata de un modelo de propósito general, sino de un artefacto de investigación para reproducir una voz y un dominio muy específicos.

Su relevancia es limitada fuera de ese nicho, pero resulta interesante como ejemplo de adaptación de un TTS base a un hablante y un registro concretos con recursos mínimos (menos de 2 horas de audio) y licencia Apache 2.0, lo que permite inspeccionar y reutilizar la receta de ajuste fino. El modelo tiene 1.916.676.352 parámetros reales según los pesos safetensors y un repositorio de 4,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (modelo de síntesis de voz con tokenizador de audio a 12 Hz; incluye talker y sub-talker) |
| Parametros totales | 1.916.676.352 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card solo muestra carga en bfloat16) |
| Idiomas soportados | telugu (`te`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-TTS, un sistema de texto a voz que emplea un tokenizador de audio a 12 Hz y una estructura de dos componentes: un "talker" principal y un "sub-talker". La función de pérdida combina la entropía cruzada del talker con 0,3 veces la del sub-talker. El ajuste fino se realizó sobre el checkpoint sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep, sin pasar por la etapa intermedia de 87 horas que menciona el autor.

El entrenamiento consistió en 17 épocas (272 actualizaciones, 16 por época) con batch 1x8, tasa de aprendizaje constante de 1e-6 tras 10 actualizaciones de calentamiento, optimizador AdamW con weight decay 0,01, recorte de gradiente de 1,0, pesos maestros en fp32 y autocast en bfloat16. El corpus fue de 127 unidades (1,83 horas) del conjunto swamiji-navaratri-telugu-reuse-themes, con una única x-vector fija de Swamiji (un tema de Navaratri de unos 10 segundos) colocada en la ranura de hablante. El autor indica que corrigió errores conocidos del script oficial `sft_12hz.py`: proyección de texto, desplazamiento único, estado del sub-talker en p-1, etiquetas del sub-talker sin desplazar y pesos maestros en fp32.

## Capacidades

- Generación de voz en telugu a partir de texto, con la identidad vocal fija de "swamiji".
- Salida de audio muestreada mediante la API `generate_custom_voice` de la librería `qwen_tts`.
- Modo no streaming (`non_streaming_mode=True`) para generación completa de la locución.
- Especialización en textos temáticos de Navaratri; no se documenta cobertura fuera de ese dominio.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta clonación de voz arbitraria ni control de emoción o estilo más allá de la x-vector fija.
- No se documentan capacidades multilingües: el modelo declara únicamente `te`.

## Casos de uso

- Locución de textos devocionales de Navaratri en telugu: el modelo está entrenado específicamente sobre este corpus, por lo que es adecuado para narrar pasajes temáticos con la voz de Swamiji.
- Generación de audio para archivos o publicaciones de una comunidad concreta: al fijar una identidad vocal, permite mantener coherencia de voz en una serie de grabaciones sin necesidad de un hablante humano.
- Reproducción de investigación sobre ajuste fino de TTS: sirve como referencia para adaptar un modelo Qwen3-TTS a un hablante con menos de 2 horas de audio y 17 épocas.
- Pruebas de pipeline con la librería `qwen_tts`: el snippet de la model card permite validar la carga en bfloat16 y la generación no streaming en un entorno con GPU.
- Evaluación de recetas de entrenamiento: el autor documenta correcciones al script oficial `sft_12hz.py`, útil para quien reproduzca el experimento.
- Generación de material de audio de dominio restringido en telugu para validación interna o demostraciones, dado el carácter de investigación del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,9 mil millones de parámetros en bfloat16, los pesos ocupan aproximadamente 3,8 GB, a lo que hay que sumar el estado del tokenizador de audio y el overhead de la librería.
- GPU recomendadas: no disponible; la model card solo muestra `device_map="cuda:0"` con `dtype=torch.bfloat16`.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 8 GB o más de VRAM, aunque no está confirmado en la información proporcionada.
- Opciones de despliegue: la model card usa la librería `qwen_tts` (`Qwen3TTSModel.from_pretrained`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| qwen3-tts-12hz-1.7b-swamiji-te-navaratri-only-lr1e-6-17ep | 1.916.676.352 | no disponible | te | Apache 2.0 | Ajuste fino especializado en una voz y un corpus de Navaratri |
| sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep | no disponible | no disponible | te | no disponible | Modelo base del que deriva; ajustado sobre IndicTTS telugu |
| Qwen3-TTS 12Hz 1.7B (base) | ~1,7B (según nombre) | no disponible | no disponible | no disponible | Modelo original de la familia Qwen3-TTS |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor lo etiqueta como "(research)" y no documenta evaluación de calidad objetiva.
- Dominio muy restringido: entrenado solo con textos temáticos de Navaratri en telugu; el comportamiento fuera de ese dominio no está caracterizado.
- Una única identidad vocal fija (x-vector de Swamiji); no permite seleccionar otras voces.
- Corpus de entrenamiento pequeño (127 unidades, 1,83 horas), lo que aumenta el riesgo de sobreajuste y de artefactos en textos no vistos.
- Riesgo de alucinación acústica: pronunciación incorrecta, omisiones o ruido en palabras fuera del vocabulario de entrenamiento; no cuantificado.
- Sin datos publicados sobre sesgos, robustez ante ruido, ni evaluación de inteligibilidad.
- Licencia Apache 2.0 permite uso comercial, pero la identidad vocal de una persona real puede estar sujeta a derechos de imagen o consentimiento; verificar antes de cualquier uso público.
- No se documentan requisitos de atribución ni restricciones adicionales más allá de la licencia.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-navaratri-only-lr1e-6-17ep
- Modelo base: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep
- Corpus de referencia citado en la model card: sw-voice/swamiji-navaratri-telugu-reuse-themes (no se proporciona URL directa)
- Repositorio de código citado: `swamiji-tts`, ruta `research/exp-iterations/08-qwen3-tts/experiments/03-swamiji-te-two-stage` (no se proporciona URL directa)
