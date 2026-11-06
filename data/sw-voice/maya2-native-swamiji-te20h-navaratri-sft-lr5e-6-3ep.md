# sw-voice/maya2-native-swamiji-te20h-navaratri-sft-lr5e-6-3ep

## Resumen

`maya2-native-swamiji-te20h-navaratri-sft-lr5e-6-3ep` es un ajuste fino completo (*full fine-tune*) del modelo de síntesis de voz `maya-research/maya2-native`, publicado por el usuario `sw-voice` en Hugging Face. El objetivo declarado es la clonación y síntesis de la voz de una persona concreta ("Swamiji"), especializada en el subconjunto de datos "Navaratri Telugu" (temas de Navaratri en telugu, con clips recortados a 100 ms). Se trata, por tanto, de un modelo TTS de dominio muy restringido, no de un modelo conversacional ni de propósito general.

El modelo cuenta con 2.502.398.656 parámetros (aproximadamente 2,5 mil millones) en formato safetensors, con un tamaño de repositorio de 5,0 GB. La model card es extremadamente escueta: no documenta arquitectura interna, longitud de contexto, idiomas soportados ni resultados de evaluación. La información disponible se limita a los hiperparámetros del ajuste fino (LR 5e-06, 3 épocas, 48 actualizaciones, batch 1x8, warmup lineal de 12 actualizaciones seguido de tasa constante) y a las instrucciones de carga mediante la clase `Maya3TTS.from_pretrained(...)` con registro de un clip de referencia en `mode="spk"`.

Su relevancia es limitada y de nicho: sirve como ejemplo de flujo de trabajo de ajuste fino de TTS sobre un modelo base, y como artefacto reproducible para quien quiera replicar el pipeline `swamiji-tts` (`research/maya2-sft`). No hay descargas ni *likes* registrados en el momento de la consulta, y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de text-to-speech; arquitectura interna no documentada) |
| Parametros totales | 2.502.398.656 (~2,5 mil millones) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (los datos de ajuste son en telugu, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de documentación sobre la arquitectura interna del modelo base `maya-research/maya2-native` ni sobre el diseño del ajuste fino más allá de los hiperparámetros declarados. La model card indica que se trata de un *full fine-tune* (actualización de todos los pesos, no LoRA ni adaptadores) del modelo base, y que la carga se realiza con la clase `Maya3TTS`, lo que sugiere una implementación propia del autor del modelo base para inferencia TTS.

El entrenamiento se organizó en dos fases: primero una "stage 1" no detallada y después el conjunto "Navaratri Telugu themes", con los clips recortados a 100 ms y cada fila asociada a un clip de referencia fijo (`ref_te2`). El fichero de datos `clips_te_trim.pt` usa una notación `FILE*N` para repetir N veces cada fila por época. Se ejecutaron 3 épocas (48 actualizaciones) con LR 5e-06, batch 1x8, warmup lineal de 12 actualizaciones y después tasa constante. No se documenta el número total de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Síntesis de voz (text-to-speech) condicionada a un clip de referencia registrado con `mode="spk"`.
- Clonación de voz específica del hablante "Swamiji" a partir del clip de referencia `ref_te2`.
- Generación de audio en telugu para el dominio de los datos de ajuste (temas de Navaratri).
- No se documenta soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso ni modo *thinking*.
- No se documenta capacidad multilingüe más allá del telugu de los datos de entrenamiento.
- No se documenta soporte de visión ni audio de entrada (el pipeline es text-to-speech).

## Casos de uso

- Síntesis de voz personalizada para un hablante concreto: el modelo permite generar audio con la voz de "Swamiji" registrando el clip de referencia `ref_te2` en `mode="spk"`, adecuado para producir narraciones con una identidad vocal fija.
- Producción de contenido devocional en telugu: los datos de ajuste corresponden a temas de Navaratri, por lo que el modelo es adecuado para generar recitaciones o narraciones de ese dominio temático.
- Replicación de experimentos de ajuste fino TTS: el repositorio documenta hiperparámetros y el pipeline `swamiji-tts` (`research/maya2-sft`), lo que permite reproducir el entrenamiento y comparar configuraciones.
- Generación de *voiceovers* de bajo coste en un pipeline de audio: al ser un modelo de 2,5 mil millones de parámetros con pesos safetensors, puede integrarse en un servicio de síntesis por lotes para clips cortos.
- Pruebas de calidad de clonación de voz en investigación: sirve como punto de partida para evaluar la fidelidad de la clonación con un clip de referencia fijo frente a otros ajustes del mismo modelo base.
- Docencia y demostraciones de TTS: el tamaño moderado (5 GB de repositorio) facilita su despliegue en entornos de laboratorio para ilustrar el flujo completo de ajuste fino y registro de hablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (2,5 mil millones de parámetros), en FP16 se necesitarían aproximadamente 5 GB solo para los pesos, más memoria para activaciones y buffers de audio; en FP32, unos 10 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar funcionamiento en GPUs de consumo con al menos 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090), pero no está confirmado.
- Cabe en GPU de consumo: probablemente sí en modelos con 12 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: la model card indica carga mediante `Maya3TTS.from_pretrained(...)` del paquete `swamiji-tts` (`research/maya2-sft`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `maya-research/maya2-native` sería el punto de referencia natural, pero no se han publicado sus especificaciones ni resultados en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| maya2-native-swamiji-te20h-navaratri-sft-lr5e-6-3ep | ~2,5 mil millones | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| maya-research/maya2-native (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de nicho: ajustado exclusivamente sobre la voz de "Swamiji" y el subconjunto "Navaratri Telugu"; su comportamiento fuera de ese dominio (otros hablantes, otros idiomas, otros registros) es desconocido y probablemente degradado.
- Sesgos conocidos: no documentados. Al entrenarse sobre una única voz y temática, puede reproducir características prosódicas y estilísticas muy específicas del hablante y del material de entrenamiento.
- Riesgo de alucinación: en TTS se traduce en artefactos de audio, pronunciación incorrecta o prosodia anómala, especialmente con texto de entrada fuera del dominio de entrenamiento. No hay evaluación publicada.
- Limitaciones de contexto e idioma: no se documenta la longitud máxima de texto de entrada ni los idiomas soportados; los datos de ajuste son en telugu.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial y modificación, pero conviene verificar la licencia del modelo base `maya-research/maya2-native` y los derechos sobre la voz clonada, que pueden estar sujetos a consentimiento del hablante y a normativa de protección de datos y de síntesis de voz.
- Caveats para producción: sin benchmarks, sin documentación de arquitectura, sin métricas de latencia ni de calidad (MOS), y con 0 descargas registradas; no es un artefacto validado para despliegue en producción.
- El contenido de la model card es mínimo y no incluye información sobre el dataset, el preprocesamiento completo ni las condiciones de la "stage 1".

## Enlaces

- Hugging Face: https://huggingface.co/sw-voice/maya2-native-swamiji-te20h-navaratri-sft-lr5e-6-3ep
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Repositorio de código citado en la model card: `swamiji-tts`, ruta `research/maya2-sft` (no se proporciona URL en la información disponible)
- Papers, blogs y demos: no disponibles en la información proporcionada.
