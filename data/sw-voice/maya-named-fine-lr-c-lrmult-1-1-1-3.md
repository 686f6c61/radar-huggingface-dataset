# sw-voice/maya-named-fine-lr-c-lrmult-1-1-1-3

## Resumen

Maya-named-fine-lr-c-lrmult-1-1-1-3 es un ajuste fino completo (full fine-tune) del modelo base maya-research/maya2-native, desarrollado por el usuario sw-voice. Se trata de un modelo de síntesis de voz (text-to-speech) especializado en clonar una voz concreta denominada "Swamiji", con soporte para prompts de voz con nombre y sin necesidad de clip de referencia en tiempo de inferencia.

El modelo parte de una arquitectura de TTS de aproximadamente 2.500 millones de parámetros (2.502.398.656 según los pesos en safetensors) y se distribuye bajo licencia Apache 2.0. El ajuste se realizó sobre un conjunto de datos compuesto por 719 clips en inglés junto con temas de Navaratri en telugu y kannada, repetidos tres veces por época, empleando una tasa de aprendizaje de 5e-06 durante 3 épocas (552 actualizaciones) con calentamiento lineal.

Su relevancia radica en que ejemplifica el flujo de trabajo de ajuste fino de voces con nombre sobre modelos TTS open source, permitiendo generar habla con una identidad vocal fija mediante una etiqueta textual en el prompt. No obstante, se trata de un artefacto de investigación con cero descargas y sin métricas publicadas, por lo que su uso en producción requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de TTS, maya2-native) |
| Parametros totales | 2.502.398.656 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponibles (datos de entrenamiento en inglés, telugu y kannada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base maya-research/maya2-native más allá de su naturaleza como sistema de text-to-speech. El ajuste fino es completo (todos los parámetros entrenables), no un adaptador LoRA, y se realizó sobre el checkpoint base con el código del repositorio swamiji-tts, rama research/maya2-sft.

El entrenamiento empleó la receta exp2c: 719 clips en inglés más clips de temas de Navaratri en telugu y kannada, cada conjunto repetido tres veces por época (indicado como clips_te.pt*3 y clips_kn.pt*3). Se aplicó una tasa de aprendizaje de 5e-06 con un multiplicador de learning rate de 1,1,1,3, donde el tercer componente (fine-codebook) usa un LR triple. El esquema de LR consistió en 138 actualizaciones de calentamiento lineal seguidas de LR constante, con batch de 1x8 y un total de 552 actualizaciones en 3 épocas. No se documentan técnicas de RLHF, DPO ni innovaciones arquitectónicas adicionales.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Clonación de voz con nombre: permite invocar una voz concreta mediante la etiqueta `voice="Swamiji"` sin proporcionar clip de referencia.
- Soporte de prompt con formato `{Swamiji}: <texto>` para seleccionar la identidad vocal.
- Carga de voces predefinidas desde `voices/voices.json` mediante la clase `Maya3TTS`.
- Cobertura multilingüe limitada a los datos de entrenamiento: inglés, telugu y kannada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Generación de audiolibros y narración: el modelo puede sintetizar texto largo con una identidad vocal consistente ("Swamiji") sin necesidad de muestras de referencia, lo que simplifica la producción por lotes.
- Asistentes de voz con marca propia: permite fijar una voz corporativa concreta invocándola por nombre en el prompt, útil para sistemas de respuesta por voz con identidad de marca.
- Locución para contenido educativo multilingüe: al haberse entrenado con material en inglés, telugu y kannada, puede emplearse en la generación de material didáctico en esos idiomas, previa validación de la calidad en cada uno.
- Prototipado de interfaces conversacionales: integración en pipelines de TTS para demos de asistentes, gracias a la API simple de `generate(text, voice=...)`.
- Investigación en clonación de voz: sirve como punto de partida para estudiar el efecto del ajuste fino completo y de los multiplicadores de LR sobre la calidad de voces con nombre.
- Generación de avisos y mensajes pregrabados: producción de clips de audio con voz fija para sistemas de megafonía o notificaciones, siempre que se valide la calidad y se respeten las consideraciones éticas de clonación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.502 millones de parámetros, en precisión completa (fp32) se requieren aproximadamente 10 GB solo para pesos; en fp16/bf16, unos 5 GB; en cuantización de 8 bits, alrededor de 2,5 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: para fp16 se recomienda una GPU con al menos 8-12 GB de VRAM (RTX 3080/4080, RTX 4090, A10, L4); para fp32, A100 o H100.
- Cabe en GPU de consumo: sí, en fp16 en tarjetas con 8 GB o más, y potencialmente en 8 bits en GPU de 4-6 GB, aunque no se ha verificado el soporte de cuantización.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante la clase `Maya3TTS` del repositorio swamiji-tts.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Sin benchmarks ni métricas de calidad publicadas; se desconoce la fidelidad de la voz clonada y la inteligibilidad en cada idioma.
- Los idiomas soportados no están declarados formalmente; la cobertura real en telugu y kannada depende de los datos de entrenamiento y no está verificada.
- Riesgo de alucinación acústica y artefactos en la síntesis, especialmente fuera de la distribución de los datos de entrenamiento.
- Sesgos potenciales derivados de la voz de origen ("Swamiji") y de la composición del dataset (predominantemente inglés).
- Consideraciones éticas y legales: la clonación de voz requiere consentimiento explícito de la persona cuya voz se replica; la licencia Apache 2.0 no exime de las obligaciones de protección de datos y derechos de imagen.
- No se documentan limitaciones de longitud de contexto ni de duración máxima de audio generado.
- El uso comercial está permitido por la licencia Apache 2.0, pero la ausencia de garantías y de evaluación de calidad desaconseja su despliegue en producción sin pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/maya-named-fine-lr-c-lrmult-1-1-1-3
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Repositorio de código (rama research/maya2-sft): swamiji-tts (no se proporciona URL directa en la información disponible)
