# sw-voice/voxcpm2-stage3-te-kn-frozen-locdit-tmu1.0

## Resumen

voxcpm2-stage3-te-kn-frozen-locdit-tmu1.0 es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice, resultado de un ajuste fino completo (full fine-tune) del modelo base sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep. El modelo está especializado en la generación de voz para inglés (en), telugu (te) y kannada (kn), con un enfoque experimental en la modulación prosódica mediante la variación del parámetro de flujo temporal en el componente LocDiT. Cuenta con aproximadamente 2.290 millones de parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo resuelve el problema de la síntesis de voz multilingüe para lenguas indicas (telugu y kannada) junto con inglés, un ámbito donde los sistemas TTS comerciales suelen tener cobertura limitada. La innovación principal reside en el uso de un esquema de flow-matching con una distribución temporal alterada (t = sigmoid(N(1.0, 1)) en lugar de N(-0.4, 1)), lo que constituye una ablación de prosodia etiquetada como P10 en la investigación del autor. El componente LocDiT se mantiene congelado durante el entrenamiento, mientras que el resto de parámetros se actualizan.

Se trata de un modelo de investigación (research) con solo 19 descargas y sin likes en el momento de la ficha, lo que indica que es un artefacto experimental más que un modelo listo para producción. Su relevancia radica en explorar la adaptación de arquitecturas TTS modernas a lenguas de bajos recursos y en documentar el efecto de perturbaciones en el muestreo temporal del flow-matching sobre la prosodia resultante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (flow-matching con componente LocDiT congelado) |
| Parámetros totales | 2.290.004.544 (~2,29 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés), te (telugu), kn (kannada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VoxCPM2, un sistema de síntesis de voz que emplea flow-matching para la generación de formas de onda o representaciones acústicas. El componente LocDiT (probablemente un Diffusion Transformer local) se mantiene congelado durante el ajuste fino, mientras que el resto de los parámetros del modelo se entrenan completamente. El entrenamiento se realizó con el trainer oficial de VoxCPM, con un micro-batch de 1 y acumulación de gradientes de 4, durante 5 épocas que resultaron en 315 pasos de optimización. Se usó una tasa de aprendizaje de 0,0001 con decaimiento coseno, warmup de 48 pasos y recorte de gradiente de 1,0.

Los datos de entrenamiento provienen de los conjuntos sw-voice/swamiji-navaratri-telugu-sidon-themes y sw-voice/swamiji-navaratri-kannada-sidon-themes, con 127 y 124 unidades temáticas completas respectivamente. La innovación técnica destacable es la modificación del muestreo temporal en el flow-matching: se emplea t = sigmoid(N(1.0, 1)) en lugar de la distribución original N(-0.4, 1), lo que constituye una ablación de prosodia (P10). El modelo es reference-free: la identidad de voz está codificada en los pesos, sin necesidad de una muestra de referencia en inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada.
- Generación de voz sin referencia (reference-free): la voz objetivo está embebida en los pesos del modelo.
- Modulación prosódica mediante el esquema de muestreo temporal alterado en el flow-matching.
- Capacidad multilingüe limitada a los tres idiomas indicados.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan capacidades de visión, audio de entrada ni modos de pensamiento.
- El modelo está diseñado para investigación en prosodia y adaptación multilingüe.

## Casos de uso

- Investigación en prosodia TTS: el modelo sirve para estudiar el efecto de la distribución temporal del flow-matching sobre la naturalidad y entonación, comparando con el modelo base que usa N(-0.4, 1).
- Síntesis de voz en telugu para aplicaciones de accesibilidad: permite generar audio para lectores de pantalla o asistentes vocales en esta lengua, con la ventaja de no requerir una muestra de voz de referencia.
- Generación de contenido en kannada: útil para audiolibros, avisos o contenido educativo en esta lengua, aprovechando la identidad de voz fija embebida en los pesos.
- Evaluación comparativa de arquitecturas TTS: al ser un artefacto de investigación con parámetros de entrenamiento documentados (LR, épocas, warmup), facilita la reproducibilidad y comparación con otras variantes de la serie voxcpm2.
- Prototipado de asistentes de voz multilingües: para entornos de desarrollo que necesiten cubrir inglés, telugu y kannada con un único modelo de 2,29 mil millones de parámetros.
- Estudio de ablaciones de prosodia: el esquema P10 documentado permite aislar el impacto del muestreo temporal en la calidad percibida, sirviendo como referencia para futuros ajustes.
- Fine-tuning posterior: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para adaptaciones a otras lenguas o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2,29 mil millones de parámetros en precisión completa (fp32) se requerirían aproximadamente 9,2 GB solo para pesos, y en fp16 unos 4,6 GB, sin contar activaciones ni buffers del flow-matching.
- GPU recomendadas: no disponibles en la documentación; por tamaño, una GPU con al menos 8-12 GB de VRAM sería un punto de partida razonable en fp16, aunque no está confirmado.
- Cabe en GPU de consumo: probablemente en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090) en fp16, pero no hay confirmación oficial.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo TTS con arquitectura VoxCPM2, requeriría el código del proyecto swamiji-tts (`research/exp-iterations/06-voxcpm2-swamiji-stages`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxcpm2-stage3-te-kn-frozen-locdit-tmu1.0 | ~2,29 B | no disponible | en, te, kn | Apache 2.0 | HuggingFace (19 descargas) |
| sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep (modelo base) | no disponible | no disponible | en (y posiblemente indic) | no disponible | HuggingFace |
| Alternativas TTS multilingües de código abierto (p. ej. XTTS, Bark) | variable | no disponible | múltiples | variable | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: la model card lo etiqueta explícitamente como "research", con solo 19 descargas y sin validación comunitaria, por lo que no es recomendable para producción sin evaluación adicional.
- Cobertura lingüística limitada: solo inglés, telugu y kannada; no se documenta soporte para otras lenguas.
- Riesgo de alucinación acústica: como todo modelo generativo TTS, puede producir artefactos, prosodia anómala o pronunciaciones incorrectas, especialmente en textos fuera de dominio.
- Sesgos de datos: el entrenamiento se realizó sobre temas específicos (swamiji-navaratri-sidon-themes), lo que puede sesgar el estilo y la prosodia hacia ese dominio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no detalladas; conviene verificar la cadena de licencias.
- Sin cuantizaciones publicadas: no hay GGUF ni otros formatos optimizados, lo que dificulta el despliegue en entornos con recursos limitados.
- Documentación incompleta: faltan datos de contexto, latencia, throughput y benchmarks, lo que impide evaluar su idoneidad en producción.
- El componente LocDiT congelado limita la adaptación de esa parte de la arquitectura a nuevos dominios sin un reentrenamiento específico.

## Enlaces

- HuggingFace: https://huggingface.co/sw-voice/voxcpm2-stage3-te-kn-frozen-locdit-tmu1.0
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep
- Dataset telugu: sw-voice/swamiji-navaratri-telugu-sidon-themes (referenciado en la model card, sin URL directa confirmada)
- Dataset kannada: sw-voice/swamiji-navaratri-kannada-sidon-themes (referenciado en la model card, sin URL directa confirmada)
- Código: swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (referenciado en la model card, sin URL directa confirmada)
