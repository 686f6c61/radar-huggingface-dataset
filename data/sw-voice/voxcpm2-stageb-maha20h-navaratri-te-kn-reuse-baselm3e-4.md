# sw-voice/voxcpm2-stageB-maha20h-navaratri-te-kn-reuse-baselm3e-4

## Resumen

voxcpm2-stageB-maha20h-navaratri-te-kn-reuse-baselm3e-4 es un modelo de síntesis de voz (text-to-speech) publicado por el usuario sw-voice en Hugging Face. Se trata de un ajuste fino completo (full fine-tune) del modelo base sw-voice/voxcpm2-stageA-te-maha20h-reuse-en3h-baselm3e-4-1ep, entrenado con el entrenador oficial de VoxCPM. El modelo está orientado a la generación de voz en inglés, telugu y kannada, y su nombre indica que el objetivo del ajuste es reproducir una voz concreta ("the voice is in the weights", es decir, sin necesidad de audio de referencia en inferencia).

El modelo resuelve el problema de la clonación y síntesis de voz multilingüe para un hablante específico, en este caso asociado a grabaciones de temática "navaratri" en telugu y kannada. Con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) y un repositorio de 9,5 GB, es un modelo de tamaño medio que puede desplegarse en infraestructura de GPU de gama alta para consumidor o en servidores con aceleradores dedicados.

La relevancia de esta ficha radica en que se trata de un modelo de investigación (marcado como "research" en su model card), con licencia Apache 2.0, lo que permite uso comercial, pero con muy poca documentación pública, cero descargas y cero interacciones en el momento de la consulta. Es un artefacto de experimentación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de TTS basado en VoxCPM; el nombre del checkpoint sugiere un componente de lenguaje base "base_lm" y un decoder de flow-matching, pero no se detalla la arquitectura completa) |
| Parametros totales | 2.290.004.544 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Inglés (en), telugu (te), kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del checkpoint sw-voice/voxcpm2-stageA-te-maha20h-reuse-en3h-baselm3e-4-1ep, realizado con el entrenador oficial de VoxCPM. Según la model card, no se congeló ningún parámetro ("nothing frozen") y se entrenaron todos los pesos. El entrenamiento utilizó flow-matching con un muestreo temporal t = sigmoid(N(1.0, 1)), un learning rate base de 5e-5 con cosine decay y warmup de 24 pasos, y un learning rate diferenciado de 3e-4 para los parámetros cuyo nombre empieza por `base_lm.*`. Se aplicó gradient clipping de 1.0.

Los datos de entrenamiento provienen de los conjuntos sw-voice/swamiji-navaratri-telugu-reuse-themes y sw-voice/swamiji-navaratri-reuse-themes (versión kannada), con 127 y 124 unidades temáticas completas respectivamente, en modalidad RE-USE. Se realizaron 5 épocas con micro-batch de 1 y acumulación de gradiente de 8, lo que equivale a 160 pasos de optimización. El modelo es "reference-free": la identidad vocal está codificada en los pesos y no requiere un audio de referencia en el momento de la inferencia. El código del experimento se encuentra en el repositorio swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages`.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada.
- Generación de voz con identidad de hablante fija integrada en los pesos (reference-free), sin necesidad de clonación por audio de referencia en inferencia.
- Capacidad multilingüe limitada a los tres idiomas indicados; no se documentan otros.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje conversacional).
- No se documentan capacidades de visión, audio de entrada ni modos de "thinking".
- No se documentan capacidades de control de estilo, emoción o prosodia más allá de lo que el modelo base VoxCPM permita de forma implícita.

## Casos de uso

- Síntesis de voz para contenido devocional o cultural en telugu y kannada: el modelo puede generar narraciones de temática navaratri con una voz consistente, aprovechando que fue ajustado sobre unidades temáticas de ese dominio y que la identidad vocal está fijada en los pesos.
- Audiolibros y narración de textos largos en inglés, telugu o kannada: al no requerir audio de referencia, se puede integrar en un pipeline de conversión de texto a audio por lotes sin gestión de muestras de voz.
- Asistentes de voz para aplicaciones dirigidas a hablantes de telugu o kannada: el modelo cubre dos idiomas del sur de la India poco representados en TTS comerciales, lo que permite localizar interfaces conversacionales.
- Generación de voces para vídeos educativos o divulgativos multilingües: un mismo texto puede sintetizarse en inglés, telugu y kannada manteniendo una identidad vocal coherente entre versiones.
- Prototipado de investigación en TTS multilingüe: al ser un modelo de investigación con licencia Apache 2.0, sirve como base para experimentos de ajuste fino adicional o para estudiar transferencia entre idiomas.
- Accesibilidad: lectura en voz alta de contenido web o documentos para usuarios de telugu y kannada, con un modelo que no exige infraestructura de clonación de voz.
- Do-blaje o localización de contenido audiovisual hacia telugu y kannada: sustitución de pistas de voz en materiales formativos o corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,29 mil millones de parámetros en safetensors, los pesos en precisión completa (fp32) ocupan aproximadamente 9,2 GB; en fp16/bf16, unos 4,6 GB. La VRAM real necesaria es mayor por el estado del decoder de flow-matching y los buffers de audio, pero no se dispone de cifras oficiales.
- GPU recomendadas: para fp16, una GPU con 8-12 GB de VRAM puede ser suficiente en teoría; para mayor margen y throughput, se recomiendan A100, H100, L40S o RTX 4090. No hay datos oficiales de latencia ni throughput.
- Cabe en GPU de consumidor: probablemente en RTX 3090, RTX 4090, RTX 4080 y modelos con 12 GB o más en fp16; en fp32 requeriría al menos 12-16 GB. No confirmado por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM, no a TTS). El despliegue requeriría el código del entrenador VoxCPM o el repositorio swamiji-tts.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxcpm2-stageB-maha20h-navaratri-te-kn-reuse-baselm3e-4 | 2,29 B | No disponible | en, te, kn | Apache 2.0 | Hugging Face (0 descargas) |
| Modelo base: voxcpm2-stageA-te-maha20h-reuse-en3h-baselm3e-4-1ep | No disponible | No disponible | en, te (según nombre) | No disponible en la información | Hugging Face |
| Alternativas TTS multilingües de código abierto (p. ej., XTTS-v2, Bark, VITS) | No comparable directamente | No disponible | Variable | Variable | Hugging Face / repositorios |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas de la misma categoría. La comparación se limita a parámetros, licencia e idiomas.

## Limitaciones y advertencias

- Modelo marcado explícitamente como "research" en su model card: no está validado para producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Documentación muy escasa: no se detallan la arquitectura completa, el contexto, los tipos de cuantización ni los benchmarks.
- Sesgos conocidos: no documentados; al entrenarse sobre un corpus específico de temática navaratri en telugu y kannada, puede presentar sesgos de dominio y de hablante.
- Riesgo de alucinación: en TTS, el equivalente es la generación de prosodia o pronunciación incorrecta, especialmente en textos fuera del dominio de entrenamiento o en inglés, idioma para el que el ajuste fue menor (el nombre indica "reuse-en3h" en la etapa A).
- Limitaciones de idioma: solo se declaran en, te y kn; no hay soporte documentado para castellano ni otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener sus propias condiciones; conviene verificar la licencia del checkpoint base y de los datasets swamiji-navaratri.
- Caveat para producción: al ser reference-free, no se puede cambiar la identidad vocal sin reentrenar; esto limita su uso en aplicaciones que requieran múltiples hablantes.
- No se documentan medidas de seguridad, filtros de contenido ni evaluación de calidad de audio.

## Enlaces

- Hugging Face: https://huggingface.co/sw-voice/voxcpm2-stageB-maha20h-navaratri-te-kn-reuse-baselm3e-4
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-stageA-te-maha20h-reuse-en3h-baselm3e-4-1ep
- Dataset telugu: sw-voice/swamiji-navaratri-telugu-reuse-themes (referenciado en la model card; no se proporciona URL directa)
- Dataset kannada: sw-voice/swamiji-navaratri-reuse-themes (referenciado en la model card; no se proporciona URL directa)
- Código: repositorio swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (referenciado en la model card; no se proporciona URL directa)
