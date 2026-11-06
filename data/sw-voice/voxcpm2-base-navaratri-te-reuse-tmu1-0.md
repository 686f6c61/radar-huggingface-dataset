# sw-voice/voxcpm2-base-navaratri-te-reuse-tmu1.0

## Resumen

voxcpm2-base-navaratri-te-reuse-tmu1.0 es un ajuste fino completo (full fine-tune) del modelo de síntesis de voz openbmb/VoxCPM2, publicado por el usuario sw-voice bajo licencia Apache 2.0. El modelo parte de los pesos del VoxCPM2 original y se ha entrenado con el entrenador oficial del proyecto sobre un corpus propio de temática devocional (swamiji-navaratri-telugu-reuse-themes), compuesto por 127 unidades temáticas completas en telugu. El resultado es un modelo de text-to-speech especializado en una voz concreta, con capacidad declarada para inglés, telugu y kannada.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de clonación de voz por ajuste fino completo sobre una arquitectura TTS moderna, con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) y un repositorio de 9,5 GB en formato safetensors. Por otro, ilustra una práctica habitual en el ecosistema: derivar modelos especializados a partir de un checkpoint base y publicarlos con metadatos mínimos, lo que obliga a evaluar con cautela cualquier uso en producción.

Se trata de un modelo de investigación, sin descargas ni valoraciones en el momento de la consulta, y sin resultados de benchmarks publicados. Su interés técnico está en el procedimiento de entrenamiento (5 épocas, 80 pasos totales, learning rate 1e-4 con decaimiento coseno, flow matching con t muestreada de una sigmoide de una normal) y en el hecho de que la identidad vocal queda codificada en los pesos, sin necesidad de audio de referencia en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; derivada de openbmb/VoxCPM2 (modelo de síntesis de voz, pipeline text-to-speech) |
| Parametros totales | 2.290.004.544 (2,29 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), telugu (te), kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | openbmb/VoxCPM2 |
| Tamano del repositorio | 9,5 GB |
| Pipeline | text-to-speech |
| Tokenizador | Original del modelo base; en telugu, 3 tokens de byte UTF-8 por carácter |
| Fecha de publicacion | 2026-11-05 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del checkpoint openbmb/VoxCPM2, un sistema de síntesis de voz. No se congeló ningún parámetro: todos los pesos del modelo base fueron actualizados durante el entrenamiento. El procedimiento siguió el entrenador oficial de VoxCPM, con muestreo de flow matching donde el tiempo t se extrae de una sigmoide de una distribución normal con media 1,0 y desviación 1,0 (t = sigmoid(N(1.0, 1))). El ajuste se realizó directamente desde el modelo base, en el marco de una iteración A/B identificada como 06/40.

Los datos de entrenamiento provienen del conjunto sw-voice/swamiji-navaratri-telugu-reuse-themes, compuesto por 127 unidades temáticas completas en telugu bajo el esquema denominado RE-USE. La configuración fue de 5 épocas con micro-batch de 1 y acumulación de gradiente de 8 (batch efectivo de 8), lo que da un total de 80 pasos de optimización. Se empleó un learning rate de 1e-4 con decaimiento coseno, 12 pasos de warmup y recorte de gradiente de 1,0. El tokenizador es el original del modelo base, lo que implica que el telugu se representa con 3 tokens de byte UTF-8 por carácter, un detalle relevante para estimar la longitud efectiva de las secuencias durante el entrenamiento y la inferencia.

La model card indica explícitamente que el modelo es "reference-free": la identidad vocal está codificada en los pesos, de modo que no requiere un audio de referencia en el momento de la síntesis. El código del experimento se encuentra en el repositorio swamiji-tts, ruta research/exp-iterations/06-voxcpm2-swamiji-stages.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con la identidad vocal aprendida durante el ajuste fino.
- Generación de audio sin audio de referencia en inferencia (reference-free), según declara el autor.
- Cobertura declarada de tres idiomas: inglés, telugu y kannada.
- Especialización en el dominio del corpus de entrenamiento: material devocional en telugu (temas de Navaratri).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje generativo de propósito general.
- No se documentan capacidades de visión, audio de entrada ni modos de pensamiento explícitos.
- No se documenta soporte de clonación de voz zero-shot a partir de audio de referencia del usuario.

## Casos de uso

- Síntesis de audiolibros devocionales en telugu: el modelo puede narrar textos religiosos o litúrgicos con una voz consistente, ya que la identidad vocal está fijada en los pesos y no requiere muestras de referencia por cada fragmento.
- Producción de contenido educativo en telugu: grabación de lecciones o material formativo con una voz estable a lo largo de series largas, aprovechando que el ajuste se hizo sobre 127 unidades temáticas completas.
- Localización de contenido hacia kannada e inglés: el modelo declara soporte de ambos idiomas, por lo que puede emplearse para doblar o narrar material en esas lenguas, aunque la calidad fuera del telugu debe validarse empíricamente.
- Investigación en ajuste fino de TTS: sirve como caso reproducible de full fine-tune sobre VoxCPM2 con hiperparámetros documentados (5 épocas, 80 pasos, LR 1e-4 coseno, flow matching con t sigmoide), útil para estudiar el efecto de ajustes de bajo presupuesto computacional.
- Generación de avisos y anuncios de voz para aplicaciones comunitarias en telugu: mensajes cortos de información, recordatorios o anuncios con una voz recognoscible y coherente con el dominio entrenado.
- Prototipado de asistentes de voz en entornos de investigación: integración en pipelines de TTS para probar la latencia y la naturalidad del modelo antes de decidir un despliegue, dado su carácter de modelo de investigación.
- Estudio de sesgos y representación lingüística: análisis de cómo un corpus de dominio muy específico afecta a la prosodia y la cobertura fonética en telugu, comparándolo con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, WER, SIM, MCD) ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa: con 2,29 mil millones de parámetros en fp32, los pesos ocupan aproximadamente 9,2 GB; en fp16/bf16, unos 4,6 GB. A ello hay que sumar el coste del códec de audio y del estado de inferencia, no documentado.
- El repositorio ocupa 9,5 GB en safetensors, coherente con pesos en fp32 o con múltiples ficheros de precisión mixta.
- GPU recomendadas para fp16: tarjetas con 8-12 GB de VRAM o más, como RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100 o H100. En fp32 conviene disponer de 16 GB o más.
- Cabría en GPU de consumo con al menos 8 GB en fp16, aunque no se han publicado mediciones de latencia ni de throughput que lo confirmen.
- Opciones de despliegue: no se documentan explícitamente. Al ser un modelo derivado de VoxCPM2 con pesos safetensors, es razonable esperar compatibilidad con el código oficial de VoxCPM, pero la model card no confirma soporte de vLLM, llama.cpp, Ollama o TGI, y estos motores no están orientados por defecto a TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| voxcpm2-base-navaratri-te-reuse-tmu1.0 | 2,29 mil millones | No disponible | en, te, kn | Apache 2.0 | safetensors | Ajuste fino especializado en voz devocional en telugu; sin benchmarks |
| openbmb/VoxCPM2 (modelo base) | No disponible en la informacion | No disponible | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Punto de partida del ajuste; cobertura multilingüe general previsiblemente mayor |
| Alternativas TTS open source de tamano comparable | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa |

La comparación cuantitativa con otros sistemas TTS no es posible con los datos disponibles: no hay métricas de calidad, latencia ni cobertura lingüística publicadas para este checkpoint.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo etiqueta explícitamente como "(research)"; no hay evidencia de validación en producción.
- Sin benchmarks ni métricas de calidad publicadas: no se puede afirmar nada sobre naturalidad, inteligibilidad o similitud vocal respecto al modelo base.
- Dominio de entrenamiento muy estrecho: 127 unidades temáticas de material devocional en telugu, 5 épocas y solo 80 pasos de optimización. Es esperable un sobreajuste al estilo y al vocabulario del corpus, con degradación fuera de ese dominio.
- Cobertura multilingüe dudosa: aunque declara inglés y kannada, el entrenamiento se realizó sobre un corpus en telugu; la calidad en las otras lenguas no está verificada y podría haberse degradado respecto al modelo base.
- Tokenización ineficiente para telugu: 3 tokens de byte UTF-8 por carácter implica secuencias más largas de lo habitual, con impacto en velocidad y en el coste computacional.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir prosodia incorrecta, artefactos o pronunciaciones erróneas, especialmente en palabras fuera del vocabulario de entrenamiento.
- Sesgos potenciales: al derivar de un corpus religioso concreto, la voz y el estilo pueden arrastrar características prosódicas específicas poco adecuadas para otros contextos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base openbmb/VoxCPM2 y de los datos de entrenamiento, que no se detallan en la información disponible.
- Implicaciones éticas: es un modelo de clonación de voz por ajuste fino; su uso para suplantar identidad sin consentimiento puede infringir normativas de protección de datos y derechos de imagen.
- Sin datos de cuantización: no se documentan versiones GGUF, AWQ, GPTQ ni similares, lo que limita el despliegue en hardware modesto sin trabajo adicional de conversión.
- Repositorio con 0 descargas y 0 valoraciones: no hay retroalimentación de la comunidad que permita estimar su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/voxcpm2-base-navaratri-te-reuse-tmu1.0
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Dataset de entrenamiento (referenciado en la model card): sw-voice/swamiji-navaratri-telugu-reuse-themes
- Repositorio de código del experimento (referenciado): swamiji-tts, ruta research/exp-iterations/06-voxcpm2-swamiji-stages (no se dispone de URL directa en la informacion proporcionada)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
