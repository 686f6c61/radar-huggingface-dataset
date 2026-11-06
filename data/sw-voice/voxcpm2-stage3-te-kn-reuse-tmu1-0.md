# sw-voice/voxcpm2-stage3-te-kn-reuse-tmu1.0

## Resumen

voxcpm2-stage3-te-kn-reuse-tmu1.0 es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice, consistente en un ajuste fino completo del modelo base sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep, a su vez derivado de la familia VoxCPM2. El modelo sintetiza una voz concreta (denominada "Swamiji" por el autor) en inglés, telugu y kannada sin necesidad de clip de referencia, ya que la identidad vocal queda embebida en los pesos tras el entrenamiento. Está pensado como artefacto de investigación, no como producto listo para producción.

Con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) y un repositorio de 9,5 GB en formato safetensors, el modelo se distribuye bajo licencia Apache 2.0. El entrenamiento se realizó con el trainer oficial de VoxCPM sobre dos conjuntos de datos de unidades temáticas en telugu y kannada (127 y 124 unidades respectivamente), con 160 pasos totales en 5 épocas. Su relevancia es limitada y muy específica: demuestra la viabilidad de un ajuste fino multilingüe con identidad vocal fija y sin referencia a partir de un modelo base índico, dentro de una serie de experimentos numerados del autor.

Se trata de un modelo de nicho, con 23 descargas y ningún "like" en el momento de la consulta, creado el 31 de octubre de 2026 y actualizado el 2 de noviembre de 2026. La model card lo etiqueta explícitamente como "(research)".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz de la familia VoxCPM2; detalles de arquitectura interna no especificados en la información proporcionada) |
| Parametros totales | 2.290.004.544 (2,29 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés), te (telugu), kn (kannada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (capas, mecanismo de atención, componentes de códec o difusión). Lo que sí se documenta es el procedimiento de ajuste fino: se parte del modelo sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep y se entrena con el trainer oficial de VoxCPM2. El autor menciona el uso de "flow-matching" con una distribución de tiempo t = sigmoid(N(1.0, 1)), lo que sugiere que el modelo emplea un esquema de generación basado en flow matching, habitual en modelos TTS modernos, aunque no se especifican los detalles del backbone.

El entrenamiento utilizó los conjuntos sw-voice/swamiji-navaratri-telugu-reuse-themes y sw-voice/swamiji-navaratri-kannada-reuse-themes, con 127 y 124 unidades temáticas completas respectivamente, en modo RE-USE y sin capas congeladas ("nothing frozen"). La configuración fue: micro-batch 1 con acumulación 8, 5 épocas hasta 160 pasos, learning rate 0,0001 con scheduler coseno, 24 pasos de warmup y grad clip de 1,0. Se entrenaron todos los parámetros. El resultado es un modelo "reference-free": la voz no se condiciona con un clip de audio en inferencia, sino que reside en los pesos. No se documenta el uso de RLHF, DPO ni el volumen total de tokens de audio procesados.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada con una única identidad vocal ("Swamiji") embebida en los pesos.
- Generación de voz sin clip de referencia (reference-free), lo que simplifica el pipeline de inferencia al no requerir audio de muestra.
- Capacidad multilingüe limitada a los tres idiomas indicados; no se documentan otros.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking"; es un modelo exclusivamente TTS.
- No se documentan capacidades de control de estilo, emoción, velocidad o prosodia más allá de lo que el modelo base pudiera ofrecer.

## Casos de uso

- Investigación en clonación de voz sin referencia: el modelo permite estudiar cómo se embebe una identidad vocal concreta en los pesos mediante ajuste fino completo, sirviendo de base para experimentos comparativos dentro de la serie del autor.
- Síntesis de contenido devocional o narrativo en telugu y kannada: el modelo está entrenado sobre unidades temáticas de Navaratri, por lo que es adecuado para generar narraciones o lecturas de temática similar en esos idiomas con una voz consistente.
- Generación de audiolibros multilingües de bajo coste: al no requerir clip de referencia, se puede integrar en un pipeline por lotes que reciba texto en inglés, telugu o kannada y produzca audio con la misma voz en los tres idiomas.
- Prototipado de asistentes de voz regionales: para desarrolladores que necesiten una voz en telugu o kannada en fase de prueba de concepto, el modelo ofrece una alternativa de pesos abiertos con licencia Apache 2.0.
- Evaluación de técnicas de ajuste fino TTS: la configuración documentada (flow-matching, LR coseno, entrenamiento completo) sirve como referencia reproducible para comparar estrategias de entrenamiento en modelos VoxCPM2.
- Localización de contenido educativo: traducción y doblaje de materiales formativos del inglés al telugu y kannada manteniendo una voz uniforme, útil en contextos de formación interna o divulgación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 2,29 mil millones de parámetros en fp16 requiere aproximadamente 4,6 GB solo para pesos, a lo que habría que sumar memoria para activaciones y el códec vocacional; en fp32 serían unos 9,2 GB. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no disponible. No se documentan pruebas en A100, H100, RTX 4090 ni otras GPU.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros, cabría esperar que quepa en GPU de consumo con 8-12 GB de VRAM en precisión reducida, pero no hay confirmación oficial.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia. El autor menciona el repositorio de código `swamiji-tts` con la ruta `research/exp-iterations/06-voxcpm2-swamiji-stages`, pero no se proporciona enlace.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. Como referencia estructural, se puede comparar con su modelo base y con el modelo que lo reemplazó en la serie del autor:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| voxcpm2-stage3-te-kn-reuse-tmu1.0 | 2,29 mil millones | no disponible | en, te, kn | Apache 2.0 | Objeto de esta ficha |
| sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep | no disponible | no disponible | no disponible | no disponible | Modelo base |
| sw-voice/best-vox | no disponible | no disponible | no disponible | no disponible | Modelo que lo reemplazó según la model card |

No se dispone de información sobre modelos de terceros (por ejemplo, otros TTS multilingües de tamaño similar) en la documentación proporcionada, por lo que no se puede establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- Modelo etiquetado explícitamente como "research": no está validado para uso en producción y carece de documentación sobre robustez, latencia o calidad en condiciones reales.
- Entrenamiento muy corto (160 pasos, 5 épocas) sobre un conjunto de datos pequeño (127 + 124 unidades temáticas), lo que limita la generalización a dominios y estilos alejados de los datos de entrenamiento.
- Identidad vocal única y fija: no es posible cambiar de voz sin reentrenar; no se documentan controles de emoción, estilo o prosodia.
- Cobertura lingüística restringida a inglés, telugu y kannada; no se garantiza un comportamiento correcto en otros idiomas ni en mezclas de código.
- Riesgo de alucinación acústica y artefactos en textos largos, fuera de dominio o con puntuación atípica; no se documentan evaluaciones de inteligibilidad (WER, MOS) que permitan cuantificar este riesgo.
- Sesgos potenciales derivados de los datos de entrenamiento (temática devocional Navaratri), que pueden reflejar un registro y vocabulario muy específicos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad legal y ética del uso (incluida la suplantación de voz) recae en el usuario.
- No se documentan requisitos de atribución adicionales ni restricciones de uso más allá de la licencia Apache 2.0.
- El modelo fue reemplazado por sw-voice/best-vox y posteriormente recuperado con su nombre original, lo que sugiere que su estado en la serie de experimentos del autor es secundario.

## Enlaces

- Hugging Face: https://huggingface.co/sw-voice/voxcpm2-stage3-te-kn-reuse-tmu1.0
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep
- Modelo sustituto en la serie: https://huggingface.co/sw-voice/best-vox
- Conjunto de datos telugu: sw-voice/swamiji-navaratri-telugu-reuse-themes (referenciado en la model card, sin URL directa proporcionada)
- Conjunto de datos kannada: sw-voice/swamiji-navaratri-kannada-reuse-themes (referenciado en la model card, sin URL directa proporcionada)
- Código: repositorio `swamiji-tts`, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (sin URL directa proporcionada)
