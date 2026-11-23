# Thox-ai/ThoxSpeech-ASR-BitNet

## Resumen

ThoxSpeech-ASR-BitNet es una redistribucion literal (verbatim) del modelo de reconocimiento automatico del habla multilingue microsoft/VibeVoice-ASR-BitNet, publicada por Thox-ai como espejo para transcripcion en CPU dentro de su stack local-first. No se ha reentrenado ni recuantizado: THOX declara explicitamente que la autoria de los pesos corresponde a Microsoft y que la licencia MIT se mantiene. El repositorio contiene unicamente los artefactos GGUF necesarios para ejecutar el modelo con un runtime ggml especifico de ASR.

El modelo sigue una arquitectura de dos etapas: un tokenizador acustico (VAE encoder) cuantizado en I8_S de 0,65 GB y un decodificador tipo language model cuantizado en I2_S / Q6_K de 0,92 GB, sumando 1,58 GB en disco. El dato de safetensors del repositorio indica 1.777.088.000 parametros, aunque la model card describe el tamano en funcion de los ficheros GGUF. Esta pensado para inferencia exclusivamente en CPU, sin GPU, lo que lo hace relevante para despliegues en dispositivos con recursos limitados y para escenarios de privacidad donde el audio no debe salir del equipo.

Su interes actual reside en la combinacion de cuantizacion ternaria (I2_S) con un encoder en I8_S para ASR multilingue en siete idiomas (ingles, chino, frances, italiano, coreano, portugues y vietnamita), con una licencia permisiva MIT y un formato pensado para runtimes ggml dedicados. No es compatible con Ollama ni LM Studio, lo que restringe su adopcion a entornos que puedan integrar el runtime VibeVoice/BitNet ggml.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos etapas: encoder acustico (VAE) + decodificador tipo language model, en formato ggml/GGUF |
| Parametros totales | 1.777.088.000 (dato de safetensors del repo); la model card describe 1,58 GB en ficheros GGUF |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | I8_S (encoder acustico), I2_S / Q6_K (decodificador LM) |
| Idiomas soportados | en, zh, fr, it, ko, pt, vi |
| Licencia | MIT (obra upstream de Microsoft; THOX no reclama autoria) |
| Formato de pesos | GGUF (thoxspeech-lm-i2_s-embed-q6_k.gguf, thoxspeech-vae-encoder-i8_s.gguf) |

## Arquitectura y entrenamiento

La arquitectura es de dos etapas dentro del ecosistema ggml: un encoder acustico de tipo VAE cuantizado en I8_S que transforma el audio en representaciones latentes, y un decodificador con estructura de language model cuantizado en I2_S para los pesos ternarios y Q6_K para las capas de embedding y otras partes sensibles. Esta separacion permite mantener el encoder con mayor precision (8 bits) mientras el decodificador se comprime a cuantizacion ternaria (2 bits efectivos), reduciendo el tamano total a 1,58 GB y habilitando inferencia en CPU.

No se dispone de informacion detallada sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. La model card indica que THOX no realizo ningun entrenamiento adicional sobre el modelo base: se trata de una redistribucion literal de microsoft/VibeVoice-ASR-BitNet. La model card menciona de forma contradictoria un "THOX fine-tune" en la seccion de datos de entrenamiento, pero el resto del documento y el estado declarado ("VERBATIM REDISTRIBUTION") indican que no hay ajuste propio. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico del habla multilingue en siete idiomas: ingles, chino, frances, italiano, coreano, portugues y vietnamita.
- Transcripcion en CPU sin GPU, gracias a la cuantizacion ternaria del decodificador y al encoder en 8 bits.
- Ejecucion local-first: el audio se procesa en el dispositivo, sin envio a servicios externos.
- Inferencia mediante runtime ggml especifico de ASR (VibeVoice / BitNet ggml), no compatible con Ollama ni LM Studio.
- Orientado a conversacion y transcripcion de voz (tag "conversational" en el repositorio).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio mas alla del propio ASR.

## Casos de uso

- Transcripcion local en portatiles sin GPU: el modelo cabe en 1,58 GB y se ejecuta en CPU, por lo que puede desplegarse en equipos de desarrollo estandar para dictado o actas de reuniones sin depender de servicios en la nube.
- Procesamiento de audio con requisitos de privacidad: al ejecutarse integramente en el dispositivo, es adecuado para entornos donde el audio no puede salir del equipo (sanidad, legal, sector publico), siempre con revision humana de las transcripciones.
- Subtitulado multilingue de contenido: con soporte para siete idiomas, puede generar transcripciones base para subtitulos en ingles, chino, frances, italiano, coreano, portugues y vietnamita, que luego se revisan y sincronizan.
- Integracion en pipelines de datos de voz: al ser GGUF y ejecutarse con un runtime ggml, puede incorporarse a flujos batch de transcripcion de archivos de audio en servidores sin GPU.
- Prototipado de asistentes de voz: la etiqueta "conversational" y el soporte multilingue permiten usarlo como componente ASR en prototipos de asistentes conversacionales antes de escalar a modelos mayores.
- Investigacion en cuantizacion extrema: el uso de I2_S en el decodificador lo convierte en una referencia practica para estudiar el impacto de la cuantizacion ternaria en la calidad de transcripcion en distintos idiomas y condiciones acusticas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| LibriSpeech-clean (WER) | ~2,41 | Pruebas internas de THOX; empeora en campo lejano y habla solapada |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para inferencia exclusivamente en CPU.
- Almacenamiento: 1,58 GB para los dos ficheros GGUF (0,65 GB encoder + 0,92 GB decodificador).
- Memoria RAM: no disponible de forma explicita; por el tamano de los pesos, se estima un requisito moderado, pero no hay cifra publicada.
- GPU recomendadas: no aplica (no hay soporte GPU documentado).
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: runtime VibeVoice / BitNet ggml para ASR en CPU. Ollama y LM Studio no soportan estos ficheros por los tipos ternarios y GGUF no estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / ejecucion |
|---|---|---|---|---|---|
| ThoxSpeech-ASR-BitNet | 1.777.088.000 (safetensors); 1,58 GB GGUF | no disponible | 7 (en, zh, fr, it, ko, pt, vi) | MIT | GGUF, runtime ggml CPU |
| microsoft/VibeVoice-ASR-BitNet (upstream) | no disponible | no disponible | no disponible | MIT (segun la model card de este repo) | no disponible |
| Whisper (variantes de OpenAI) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Errores de transcripcion esperados en audio ruidoso, de campo lejano o con habla solapada; se recomienda verificar las transcripciones importantes.
- El WER de ~2,41 procede de pruebas internas de THOX sobre LibriSpeech-clean y no debe extrapolarse a otros dominios o condiciones acusticas.
- Los sesgos y comportamientos reflejan los datos de entrenamiento upstream, no documentados en detalle en la informacion disponible.
- Riesgo de alucinacion en la salida del decodificador, especialmente con audio de baja calidad o fuera de los siete idiomas soportados.
- Uso fuera de alcance declarado: decisiones medicas, legales, financieras o de seguridad sin revision humana, y control no supervisado de dispositivos fisicos sin paso de confirmacion.
- Incompatibilidad con Ollama y LM Studio; requiere un runtime ggml especifico, lo que limita las opciones de despliegue.
- La model card contiene una contradiccion entre "verbatim redistribution" y "THOX fine-tune"; conviene tratar el modelo como espejo del upstream y verificar la procedencia antes de un uso en produccion.
- Licencia MIT permisiva para uso comercial, pero la autoria de los pesos corresponde a Microsoft y debe mantenerse el aviso de copyright.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thox-ai/ThoxSpeech-ASR-BitNet
- Modelo base upstream: https://huggingface.co/microsoft/VibeVoice-ASR-BitNet
- Ficheros GGUF: thoxspeech-lm-i2_s-embed-q6_k.gguf, thoxspeech-vae-encoder-i8_s.gguf (dentro del repositorio)
- Avisos de terceros: THIRD_PARTY_NOTICES.md y NOTICE (dentro del repositorio)
- No se han encontrado en la informacion disponible papers, blogs o demos adicionales.
