# turaco-research/turaco-nano-tts-wes

## Resumen

Turaco-nano-tts-wes es un modelo de síntesis de voz (text-to-speech) desarrollado por turaco-research, un proyecto que explora tecnologías de voz para lenguas africanas de bajos recursos. Concretamente, este modelo convierte texto en audio para el pidgin inglés de Camerún (WES), una variedad lingüística con escasa representación en los sistemas TTS comerciales. Deriva del modelo base kyutai/pocket-tts mediante un proceso de adaptación supervisada sobre grabaciones de voz reales.

La relevancia del modelo radica en su tamaño reducido: 109,5 millones de parámetros (codec incluido) y un archivo de pesos de 438 MB en FP32, lo que lo sitúa como una alternativa ligera frente a la anterior entrega de la familia, Turaco CSM (1.632 millones de parámetros y 3,3 GB en FP16). El objetivo declarado es la inferencia práctica en CPU, con una hoja de ruta hacia dispositivos de borde, aplicaciones móviles y voz en navegador mediante una conversión a WebAssembly en Q8.

Se trata de un piloto de investigación de un solo hablante, con licencia CC-BY-4.0 y pesos disponibles en safetensors y GGUF. El repositorio incluye los pesos completos de inferencia, el tokenizer, una voz piloto precalculada, la configuración del modelo, la receta de entrenamiento y los resultados medidos. La calidad de pronunciación, acento y entonación aún requiere validación por hablantes nativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de kyutai/pocket-tts (tokenizer y sampler acústico preentrenados; sampler congelado) |
| Parametros totales | 109.501.826 (codec incluido) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (pesos publicados); conversión Q8 para WebAssembly en navegador |
| Idiomas soportados | Pidgin inglés de Camerún (wes) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de kyutai/pocket-tts, del que conserva el tokenizer preentrenado y el sampler acústico, cuyos pesos permanecen congelados durante la adaptación. La adaptación se realiza directamente sobre un estudiante ya publicado, como alternativa experimental a la adaptación del profesor original seguida de destilación por profundidad. El archivo de pesos (438.033.312 bytes) incluye el codec de voz; el estado de la voz piloto se almacena por separado en `voice.safetensors`.

Los datos de entrenamiento proceden de Common Voice Scripted Speech 27.0 — Cameroon Pidgin: 998 clips seleccionados, aproximadamente 59 minutos de audio mono a 24 kHz de un único hablante anónimo. Los splits originales agrupados por transcripción quedan en 897 de entrenamiento, 50 de validación y 51 de test. El alineamiento forzado se realizó con CTC en inglés como aproximación al pidgin, lo que puede introducir errores de frontera. El entrenamiento usó AdamW con LR 1e-5, batch 1, acumulación de gradientes 8, FP32 sobre una Tesla T4 y decaimiento EMA de 0,95, durante 200 pasos de optimizador (checkpoint_00000200.pt). La revisión exacta del modelo base es `a4a6054db281f0f34f3d44d626a972a44560dc83`.

## Capacidades

- Síntesis de voz a partir de texto en pidgin inglés de Camerún (WES).
- Generación de audio mono a 24 kHz mediante el codec integrado.
- Inferencia en CPU verificada en Python.
- Conversión a WebAssembly en Q8 para ejecución en navegador.
- Uso de una voz piloto precalculada a partir de una grabación CC0 de entrenamiento, sin necesidad de acceder al dataset original.
- Recomputación del estado de voz tras modificar los pesos del modelo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Aplicaciones de accesibilidad en Camerún: lectura en voz alta de textos en pidgin para usuarios con discapacidad visual, aprovechando la inferencia en CPU y el tamaño reducido del modelo para despliegue local sin conexión.
- Asistentes de voz en navegador: la conversión Q8 a WebAssembly permite integrar síntesis de voz en pidgin directamente en aplicaciones web, sin depender de servicios en la nube ni de conectividad estable.
- Contenido educativo y divulgativo: generación de narraciones en pidgin para materiales de aprendizaje, dado que el modelo produce audio a partir de texto escrito con la ortografía original del corpus.
- Preservación y promoción lingüística: creación de audiolibros y avisos comunitarios en pidgin, una lengua con escasa cobertura en tecnologías de voz comerciales.
- Prototipado en dispositivos de borde: aplicaciones móviles experimentales que requieran síntesis de voz local, con la advertencia de que la latencia y el consumo en dispositivos físicos aún no se han medido.
- Investigación en TTS para lenguas de bajos recursos: el repositorio incluye la receta de entrenamiento completa, los conteos de alineamiento y las curvas de entrenamiento, lo que facilita reproducir y extender el trabajo a otras variedades lingüísticas.
- Evaluación comparativa de destilación: sirve como referencia para estudiar la adaptación directa de un estudiante frente a la adaptación del profesor con destilación por profundidad.

## Benchmarks y rendimiento

| Medicion | Resultado |
|---|---:|
| GPU de entrenamiento | Tesla T4 |
| Pasos de optimizador | 200 |
| Clips de entrenamiento / validación / test | 897 / 50 / 51 |
| Objetivo de validación inicial | 0,527815 |
| Objetivo de validación final | 0,341064 |
| Reducción relativa del objetivo | 35,38 % |
| Parámetros (codec incluido) | 109.501.826 |
| Bytes del archivo de pesos | 438.033.312 |

| Objetivo con pesos crudos | Antes de la adaptación | Último checkpoint |
|---|---:|---:|
| flow_loss | 0,439705 | 0,330442 |
| eos_loss | 0,881103 | 0,106222 |
| loss | 0,527815 | 0,341064 |

Estas métricas son objetivos con semilla fija y teacher forcing, no puntuaciones de precisión de pronunciación ni de calidad perceptiva. No se presentan resultados de MMLU, HumanEval, GSM8K ni WER automático en inglés como medida de precisión en pidgin.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el archivo de pesos es de 438 MB en FP32, por lo que la huella de memoria es reducida.
- GPU recomendadas: la única GPU documentada en el entrenamiento es una Tesla T4; no se especifican requisitos de GPU para inferencia.
- Inferencia en CPU: verificada en Python; la velocidad varía según el dispositivo.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del archivo de pesos, aunque no se documenta una medición explícita.
- Opciones de despliegue: inferencia en CPU con la librería pocket_tts, y conversión a WebAssembly en Q8 para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el modelo card indica que la velocidad en dispositivos móviles físicos y los benchmarks de calidad con hablantes nativos están pendientes.

## Comparativa con modelos similares

| Modelo | Parametros | Archivo de pesos | Precision publicada | Licencia | Idioma |
|---|---:|---:|---|---|---|
| Turaco Nano (este modelo) | 109.501.826 | 438.033.312 bytes | FP32 | CC-BY-4.0 | Pidgin de Camerún |
| Turaco CSM | 1.632.100.161 | 3.297.957.042 bytes | FP16 | no disponible en la informacion | Pidgin de Camerún |
| kyutai/pocket-tts | no disponible | no disponible | no disponible | no disponible | no disponible |

Turaco Nano tiene aproximadamente 14,9 veces menos parámetros que Turaco CSM. La comparación de tamaño de archivo usa los ficheros publicados y sus precisiones indicadas; las dependencias en tiempo de ejecución, el estado de voz y los ejemplos generados añaden almacenamiento, y un menor tamaño de pesos no garantiza por sí solo paridad de latencia móvil, uso de memoria o calidad de voz con CSM.

## Limitaciones y advertencias

- Es un piloto de investigación de un solo hablante; no se ha demostrado rendimiento con hablantes no vistos, formato largo ni conversacional.
- Las frases del corpus son leídas, no espontáneas, lo que limita la generalización a habla natural.
- El alineamiento forzado usó CTC en inglés como aproximación al pidgin y puede introducir errores de frontera.
- Las métricas publicadas son objetivos con teacher forcing y semilla fija; no constituyen medidas de precisión de pronunciación ni de MOS.
- La validación usa recortes aleatorios de prefijo y la exportación emplea EMA mientras la validación registrada usa pesos crudos, lo que introduce una discrepancia metodológica.
- La calidad de pronunciación, acento y entonación requiere escucha por hablantes nativos; no se implica ninguna conclusión de calidad por el éxito de la exportación.
- No se presenta WER automático en inglés como medida de precisión en pidgin.
- El estado de voz piloto debe recomputarse si se modifican los pesos del modelo.
- El despliegue en navegador o móvil requiere una conversión compatible, cuantización si procede y comprobaciones medidas de calidad y tiempo de ejecución.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; el corpus de origen declara CC0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turaco-research/turaco-nano-tts-wes
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Entrega anterior de la familia: https://huggingface.co/turaco-research/turaco-csm-tts-wes-1b
- Dataset de entrenamiento (Common Voice 27.0 — Cameroon Pidgin, Mozilla Data Collective): https://mozilladatacollective.com/datasets/cmu61lm5800kco107ohj0e507
