# sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-navaratri-only-lr1e-6-3ep

## Resumen

El modelo `qwen3-tts-12hz-1.7b-swamiji-te-navaratri-only-lr1e-6-3ep` es un ajuste fino completo (full fine-tune) de un modelo de sintesis de voz (text-to-speech) de la familia Qwen3-TTS, desarrollado por el usuario `sw-voice` y publicado con licencia Apache 2.0. Se trata de un experimento de investigacion orientado a la clonacion y adaptacion de voz para un hablante concreto (identificado como "swamiji") en telugu, partiendo de un modelo base ya especializado en telugu (IndicTTS) y entrenado exclusivamente con temas de la festividad de Navaratri.

El modelo resuelve el problema de generar voz sintetica en telugu con una identidad de hablante fija y un estilo tematico muy concreto, mediante un ajuste fino sobre un corpus pequeno y especializado (1,83 horas, 127 unidades). Su relevancia es limitada y de caracter investigador: se publica como material de experimentacion, no como un modelo de produccion general, y su tamano (1,9 mil millones de parametros) y su pipeline (text-to-speech) lo sitúan en la categoria de modelos TTS de tamano medio.

La arquitectura subyacente es Qwen3-TTS con representacion de audio a 12 Hz, un diseno de tipo talker/sub-talker para la generacion de tokens de audio, y un condicionamiento por x-vector de hablante. El contexto, los datos de entrenamiento detallados y los benchmarks no se especifican en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS con representacion de audio a 12 Hz (talker + sub-talker) |
| Parametros totales | 1.916.676.352 (~1,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-TTS con una tasa de representacion de audio de 12 Hz, que combina un modulo "talker" (generador principal de tokens de audio) y un "sub-talker" (generador auxiliar de tokens de audio de menor nivel). La generacion se condiciona mediante un x-vector de hablante fijo, en este caso extraido de un tema de Navaratri de aproximadamente 10 segundos, lo que fija la identidad vocal de "swamiji". El ajuste se realiza sobre el modelo `sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep`, que a su vez es un ajuste fino sobre un modelo telugu de IndicTTS.

El entrenamiento consistio en un full fine-tune con tasa de aprendizaje constante de 1e-06 tras 10 actualizaciones de calentamiento, batch de 1x8, 3 epocas (48 actualizaciones en total), optimizador AdamW con weight decay 0.01 y recorte de gradiente de 1.0, con pesos maestros en fp32 y autocast en bf16. La funcion de perdida combina la entropia cruzada del talker con 0,3 veces la entropia cruzada del sub-talker. El corpus de entrenamiento son 127 unidades (1,83 horas) de temas de Navaratri en telugu, reutilizados del dataset `sw-voice/swamiji-navaratri-telugu-reuse-themes`. El autor indica que se corrigieron varios errores conocidos del script oficial `sft_12hz.py` (text_projection, single shift, estado del sub-talker p-1, etiquetas del sub-talker sin desplazar y pesos maestros en fp32).

## Capacidades

- Sintesis de voz (text-to-speech) en telugu con una identidad de hablante fija ("swamiji").
- Generacion de audio condicionada por un x-vector de hablante predefinido.
- Soporte de modo no streaming (`non_streaming_mode=True`) en la API de generacion.
- Generacion con seleccion de idioma automatica (`language="Auto"`).
- Capacidad multilingue: limitada al telugu (te) segun la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio de entrada.
- No se documenta modo de razonamiento (thinking mode).

## Casos de uso

- Investigacion en clonacion de voz: el modelo sirve como banco de pruebas para estudiar como un corpus pequeno (1,83 h) y un x-vector fijo afectan a la fidelidad y estabilidad de la voz sintetizada en telugu.
- Generacion de narraciones religiosas o culturales: permite sintetizar textos sobre temas de Navaratri con la voz de "swamiji", adecuado para contenido devocional en telugu.
- Evaluacion de estrategias de ajuste fino en TTS: su configuracion concreta (LR 1e-06, 3 epocas, perdida ponderada talker/sub-talker) permite comparar recetas de entrenamiento sobre el mismo modelo base.
- Reproduccion de experimentos: el autor publica la ruta del codigo (`research/exp-iterations/08-qwen3-tts/experiments/03-swamiji-te-two-stage`), lo que facilita replicar el pipeline con el script `sft_12hz.py` corregido.
- Pruebas de integracion con la libreria `qwen_tts`: sirve para validar el flujo `Qwen3TTSModel.from_pretrained` con `generate_custom_voice` en un entorno controlado.
- Generacion de audiolibros o material accesible en telugu: para pasajes tematicos coherentes con el dominio de entrenamiento, aunque con las limitaciones de generalizacion propias de un corpus tan restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1,9 B de parametros, en bf16 se necesitan aproximadamente 3,8 GB solo para los pesos, mas memoria para activaciones y buffers de audio.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria en GPUs consumer con al menos 8 GB de VRAM en bf16, pero no se confirma.
- Cabe en GPU consumer: probablemente si en tarjetas con 8 GB o mas, aunque no se documenta.
- Opciones de despliegue: la model card solo documenta el uso mediante la libreria `qwen_tts` con `device_map="cuda:0"` y `dtype=torch.bfloat16`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-tts-12hz-1.7b-swamiji-te-navaratri-only-lr1e-6-3ep | ~1,9 B | no disponible | te | Apache 2.0 | Hugging Face |
| sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep (modelo base) | ~1,9 B | no disponible | te | no disponible en la informacion | Hugging Face |
| Qwen3-TTS 12Hz 1.7B (familia base) | ~1,7 B | no disponible | no disponible | no disponible en la informacion | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo marcado explicitamente como "research" por el autor; no esta pensado para uso en produccion.
- Entrenado exclusivamente con 1,83 horas de temas de Navaratri en telugu, lo que limita severamente su generalizacion a otros dominios, estilos o vocabularios.
- Identidad de hablante fija ("swamiji") mediante un unico x-vector; no permite cambiar de voz sin reentrenamiento o sustitucion del condicionamiento.
- Solo soporta telugu; no se documenta cobertura multilingue.
- Riesgo de alucinacion y artefactos de audio fuera del dominio de entrenamiento.
- Sesgos potenciales derivados del corpus religioso y cultural concreto utilizado.
- No se documentan sesgos especificos ni evaluaciones de robustez.
- Licencia Apache 2.0 permite uso comercial, pero la calidad y adecuacion para produccion no estan garantizadas.
- No se documentan requisitos de hardware, latencia ni throughput, lo que dificulta planificar un despliegue.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- [Hugging Face: sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-navaratri-only-lr1e-6-3ep](https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-navaratri-only-lr1e-6-3ep)
- [Modelo base: sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep](https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep)
- Dataset mencionado: `sw-voice/swamiji-navaratri-telugu-reuse-themes` (no se proporciona URL directa en la informacion disponible)
- Codigo: `swamiji-tts`, ruta `research/exp-iterations/08-qwen3-tts/experiments/03-swamiji-te-two-stage` (no se proporciona URL directa en la informacion disponible)
