# voiceunlimited/vpm

## Resumen

OmniVoice es un modelo de síntesis de voz (text-to-speech, TTS) zero-shot y masivamente multilingüe, distribuido en el repositorio `voiceunlimited/vpm` y asociado al proyecto k2-fsa/OmniVoice. Su rasgo diferencial es la cobertura de más de 600 idiomas (etiquetados con códigos ISO 639-3), lo que lo sitúa entre los modelos TTS con mayor alcance lingüístico publicados hasta la fecha, además de ofrecer clonación de voz y diseño de voz (voice design) a partir de audio de referencia.

El modelo se construye sobre una arquitectura descrita por sus autores como «diffusion language model-style» y toma como base el transformer decoder Qwen/Qwen3-0.6B. El checkpoint publicado contiene 612.577.288 parámetros (~612,6 M) en formato safetensors, con un tamaño de repositorio de 3,3 GB. Se publica bajo la librería `omnivoice` y la etiqueta de pipeline `text-to-speech`.

Su relevancia actual radica en la combinación de tres factores: cobertura lingüística muy amplia, generación zero-shot sin necesidad de ajuste por hablante y una arquitectura de difusión orientada a reducir el coste de inferencia respecto a los enfoques autorregresivos convencionales. No obstante, la información pública disponible sobre entrenamiento, licencia y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión estilo language model, construido sobre el transformer decoder de Qwen3-0.6B |
| Parametros totales | 612.577.288 (~612,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | Más de 600 idiomas (etiquetas ISO 639-3, p. ej. `en`, `es`, `zh`, `ar`, `hi`, `sw`, `yue`, etc.) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe OmniVoice como un modelo TTS zero-shot basado en una arquitectura novedosa de tipo «diffusion language model», apoyada sobre el transformer decoder de Qwen3-0.6B. El uso de un esquema de difusión en el espacio de tokens lingüísticos, en lugar de una decodificación autorregresiva token a token, es lo que los autores presentan como la clave de su velocidad de inferencia superior. El paper asociado se titula «OmniVoice: Towards Omnilingual Zero-Shot Text-to-Speech with Diffusion Language Models».

No se dispone de información en los datos proporcionados sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineamiento como RLHF o DPO. Tampoco se detalla la estrategia de tokenización acústica, el vocoder empleado ni el mecanismo exacto de condicionamiento para clonación y diseño de voz. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generación de voz zero-shot: sintetiza habla a partir de texto sin necesidad de ajuste específico por hablante.
- Cobertura multilingüe de más de 600 idiomas, incluyendo lenguas de bajos recursos y variedades regionales recogidas con códigos ISO 639-3.
- Clonación de voz: reproduce el timbre y las características de un hablante a partir de una muestra corta de audio de referencia.
- Diseño de voz (voice design): permite especificar o construir características vocales sin disponer de una grabación previa del hablante objetivo.
- Inferencia rápida: la arquitectura de difusión se presenta como ventaja de velocidad frente a alternativas autorregresivas.
- No se documenta en la información disponible soporte de tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada más allá del audio de referencia para clonación.

## Casos de uso

- Doblaje y localización de contenido audiovisual: el modelo puede generar voces en cualquiera de los más de 600 idiomas soportados, lo que permite doblar un mismo vídeo a decenas de idiomas reutilizando una voz de referencia para mantener coherencia de personaje.
- Audiolibros y lectura automática: conversión de texto largo a voz con clonación de un narrador concreto a partir de una muestra breve, útil para editoriales que quieran mantener una voz de marca consistente en su catálogo.
- Accesibilidad y lectores de pantalla: síntesis de voz multilingüe para usuarios con discapacidad visual, con la ventaja de cubrir idiomas minoritarios que los sistemas TTS comerciales suelen ignorar.
- Asistentes de voz y agentes conversacionales: generación de respuestas habladas con una voz personalizada por producto o marca, aprovechando la clonación zero-shot para evitar grabaciones extensas.
- Preservación de lenguas en peligro: generación de material sonoro en lenguas con pocos hablantes y escasos recursos digitales, permitiendo producir contenidos educativos o divulgativos donde antes no existía TTS viable.
- Producción de podcasts sintéticos: creación de episodios con voces sintéticas consistentes, clonando una o varias voces de presentador y manteniendo su identidad a lo largo de múltiples episodios.
- Prototipado de personajes en videojuegos: diseño de voces para personajes no jugables mediante voice design, sustituyendo temporalmente al casting de actores de doblaje en fases tempranas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 612,6 M de parámetros, el modelo ocupa aproximadamente 1,2 GB en fp16/bf16 y alrededor de 2,4 GB en fp32, sin contar el coste adicional del vocoder ni del audio intermedio.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre debería poder ejecutar el modelo en precisión reducida; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y de sobra para este tamaño.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en GPU de consumo modernas e incluso en equipos con gráfica de gama media.
- Opciones de despliegue: la model card referencia el repositorio GitHub de k2-fsa/OmniVoice, un Space de Hugging Face y un cuaderno de Google Colab, además de la librería `omnivoice`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, dado que no es un modelo de lenguaje generativo de texto al uso.
- Latencia y throughput: la model card afirma que la arquitectura de difusión ofrece «superior inference speed», pero no se proporcionan cifras concretas de latencia ni de throughput, por lo que estos datos deben considerarse no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniVoice (voiceunlimited/vpm) | 612,6 M | no disponible | 600+ | no disponible | Hugging Face, GitHub, Space, Colab |
| Alternativas zero-shot TTS (p. ej. XTTS, F5-TTS, CosyVoice) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables de parámetros, contexto, idiomas, licencia o rendimiento de los modelos competidores, por lo que no es posible establecer una comparación cuantitativa rigurosa. La ventaja declarada por los autores frente a otros sistemas TTS zero-shot es la cobertura de más de 600 idiomas, presentada como la más amplia de su categoría.

## Limitaciones y advertencias

- La licencia no está especificada en la información disponible, por lo que no puede confirmarse si se permite el uso comercial. Es imprescindible aclarar este punto antes de integrarlo en producción.
- Riesgo de clonación de voz no autorizada: la capacidad de clonación zero-shot puede emplearse para suplantar identidades sin consentimiento, lo que exige salvaguardas legales y técnicas (verificación de consentimiento, marcas de agua en el audio generado, etc.).
- No se documentan sesgos específicos del modelo, pero al cubrir más de 600 idiomas es probable que existan disparidades de calidad y de representación entre lenguas con muchos datos y lenguas de bajos recursos.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir prosodia incorrecta, pronunciaciones erróneas o artefactos en entradas fuera de distribución o con texto atípico (números, siglas, nombres propios).
- No hay datos publicados sobre estabilidad en textos largos, por lo que se desconoce el comportamiento en contextos extensos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de validación comunitaria independiente.
- La model card describe el proyecto k2-fsa/OmniVoice, mientras que el repositorio consultado es `voiceunlimited/vpm`; conviene verificar la relación exacta entre ambos y la procedencia real del checkpoint antes de confiar en él.
- La búsqueda web realizada no devolvió resultados relacionados con el modelo, por lo que no ha sido posible corroborar de forma externa los datos de la model card.

## Enlaces

- Hugging Face (modelo consultado): https://huggingface.co/voiceunlimited/vpm
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper: https://huggingface.co/papers/2604.00688
- Repositorio GitHub: https://github.com/k2-fsa/OmniVoice
- Hugging Face Space (demo): https://huggingface.co/spaces/k2-fsa/OmniVoice
- Página de demo: https://zhu-han.github.io/omnivoice
- Cuaderno de Google Colab: https://colab.research.google.com/github/k2-fsa/OmniVoice/blob/master/docs/OmniVoice.ipynb
- Modelo OmniVoice de referencia: https://huggingface.co/k2-fsa/OmniVoice
