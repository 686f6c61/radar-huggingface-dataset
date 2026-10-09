# Vyvo/drifting-tts-tr-dacvae

## Resumen

Drifting TTS Turkish: DAC-VAE latents es un modelo experimental de síntesis de voz (text-to-speech) en turco desarrollado por Vyvo. Se trata de la variante del sistema drifting-tts que opera en el espacio latente de un VAE de audio preentrenado (DAC-VAE de Meta) en lugar de sobre mel-espectrogramas, siguiendo la configuración latente descrita por Deng et al. (2026). El generador, denominado DriftDiT, produce los latentes de DAC-VAE (128 canales a 25 Hz) en una única evaluación de red, y un decodificador DAC-VAE ajustado convierte esos latentes en audio a 24 kHz.

El modelo no es la versión recomendada por el propio autor: la model card indica explícitamente que para obtener la mejor calidad debe usarse el modelo mel publicado, Vyvo/drifting-tts-tr (v3.1). Esta variante existe como exploración técnica del espacio latente y sirve, sobre todo, para comparar el comportamiento de drifting-tts sobre distintos espacios objetivo (mel, DAC-VAE y VoxCPM2) manteniendo la misma receta y los mismos datos de entrenamiento.

Su relevancia actual es doble. Por un lado, demuestra empíricamente un problema práctico de los TTS latentes: el decodificador original de DAC-VAE produce ruido sobre latentes generados (WER del 9,55 %) y solo un ajuste fino del decodificador sobre latentes propios lo corrige (WER del 1,32 %). Por otro, mantiene el marcado de agua de estilo AudioSeal con los pesos congelados, lo que lo convierte en un caso de estudio sobre trazabilidad de audio generado. El repositorio ocupa 0,6 GB y la licencia de los pesos es CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador DriftDiT (drifting) que predice latentes de DAC-VAE de 128 canales a 25 Hz en una unica evaluacion de red; decodificador DAC-VAE ajustado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de sintesis de voz; la entrada es texto, no una ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | CC BY 4.0 (pesos del repositorio); el decodificador ajustado es derivado de DAC-VAE (Meta, Apache-2.0) |
| Formato de pesos | PyTorch `.pt` (`drifting_tts_dacvae_10k.pt`, `dacvae_decoder_ft.pt`) |
| Tamano del repositorio | 0,6 GB |
| Frecuencia de muestreo de salida | 24 kHz (valor por defecto del decodificador ajustado) |
| Voces disponibles | `studio`, `male`, `female` o cualquier identificador entero de hablante |
| Marcado de agua | Estilo AudioSeal, integrado en el decodificador DAC-VAE, con pesos congelados |

## Arquitectura y entrenamiento

La arquitectura combina dos piezas. La primera es un generador DriftDiT entrenado con el metodo de *drifting*, que genera directamente los latentes del VAE de audio en una sola pasada de red (un paso, sin bucle de difusion iterativo). La segunda es un decodificador DAC-VAE que transforma esos latentes en forma de onda. El modelo parte de `facebook/dacvae-watermarked` y se publica como ajuste fino de ese modelo base. La receta de entrenamiento y los datos son identicos a los de la version v3.1; lo unico que cambia es el espacio objetivo de prediccion (latentes en lugar de mel-espectrogramas).

El detalle tecnico mas relevante es el ajuste del decodificador. Los latentes que produce el generador son mas suaves que los latentes reales, y el decodificador original de DAC-VAE los renderiza como ruido: sobre latentes generados, el WER sube al 9,55 % y UTMOSv2 cae a 1,837. El checkpoint `dacvae_decoder_ft.pt` se entrena durante 40.000 pasos sobre los latentes generados por el propio modelo, lo que reduce el WER al 1,32 % y eleva UTMOSv2 a 2,710. En latentes reales de grabaciones no vistas, la calidad se mantiene (UTMOSv2 pasa de 2,72 a 2,70). No se documentan en la informacion disponible las fases de RLHF o DPO, el numero de tokens ni la composicion del dataset.

El marcado de agua se conserva de forma deliberada. Durante el ajuste fino solo se entrena la ruta de audio del decodificador; todos los pesos del marcador de agua permanecen congelados e identicos a los de la version publicada, y la marca se aplica a cada salida exactamente igual que con el decodificador original. Meta no ha publicado todavia un detector para este marcador, por lo que la deteccion no ha podido verificarse.

## Capacidades

- Sintesis de voz en turco a partir de texto (pipeline `text-to-speech`), con salida a 24 kHz.
- Generacion en un solo paso: el generador escribe los latentes en una unica evaluacion de red, sin bucle de difusion iterativo.
- Control de identidad de voz mediante los hablantes predefinidos `studio`, `male` y `female`, o mediante identificadores enteros de hablante.
- Reproducibilidad mediante semilla (`seed`) y control de la generacion con parametros de temperatura y alpha durante la evaluacion.
- Marcado de agua de estilo AudioSeal en todas las salidas, con pesos congelados respecto al decodificador publicado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada, modo de pensamiento ni capacidades multilingues mas alla del turco.

## Casos de uso

- Doblaje y audiolibros en turco: el modelo genera narracion a 24 kHz desde texto con voces seleccionables, adecuado para produccion de contenido editorial donde el WER del 1,32 % es aceptable y se dispone de revision humana posterior.
- Atencion al cliente automatizada en turco: permite construir respuestas de voz para IVR y asistentes telefonicos; la generacion en un solo paso reduce la latencia por respuesta, aunque el modelo no gestiona el dialogo (eso queda en el sistema que lo orquesta).
- Accesibilidad y lectores de pantalla: sintesis de texto a voz para aplicaciones turcas dirigidas a personas con discapacidad visual, con voces multiples para adaptar el tono.
- Generacion de datos sinteticos para entrenar ASR en turco: el audio etiquetado generado puede aumentar corpus de reconocimiento de voz, aprovechando que el WER del 1,32 % mantiene la inteligibilidad; conviene filtrar con un verificador externo.
- Trazabilidad de audio generado: al conservar el marcado de agua de estilo AudioSeal con pesos congelados, sirve como banco de pruebas para pipelines de procedencia y deteccion de contenido sintetico (aunque no exista todavia detector publicado).
- Investigacion en TTS de un solo paso: comparar el espacio latente DAC-VAE frente a mel y VoxCPM2 con la misma receta y los mismos datos permite aislar el efecto del espacio objetivo sobre WER, CER y calidad percibida.
- Prototipado rapido en entornos con GPU modesta: al ocupar el repositorio 0,6 GB, es viable iterar localmente antes de escalar al modelo mel v3.1 para produccion.
- Evaluacion comparativa de decodificadores: el par generador + decodificador ajustado permite reproducir el experimento que mide el impacto del ajuste fino del decodificador (WER de 9,55 % a 1,32 %).

## Benchmarks y rendimiento

Resultados publicados por el autor en Freya-TR-Eval, primeras 100 frases, hablante 722, T = 0,3 y alpha = 2. Whisper large-v3 sobre audio igualado a banda de 8 kHz; UTMOSv2 y DNSMOS sobre banda completa.

| Modelo | Decodificador / vocoder | WER | CER | UTMOSv2 | DNSMOS OVRL |
|---|---|---|---|---|---|
| v3.1 (mels, publicado) | BigVGAN-v2-ft | 0,66 % | 0,14 % | 2,934 | 3,33 |
| DAC-VAE latents (este modelo) | decodificador ajustado | 1,32 % | 0,30 % | 2,710 | 3,26 |
| DAC-VAE latents | decodificador publicado | 9,55 % | 2,91 % | 1,837 | 1,48 |
| VoxCPM2 latents | decodificador ajustado | 1,87 % | 0,43 % | 2,530 | 3,25 |

Conclusiones declaradas por el autor: el decodificador publicado suena ruidoso sobre latentes generados; el ajuste fino lo corrige (WER de 9,55 % a 1,32 % y UTMOSv2 de 1,84 a 2,71); en latentes reales de grabaciones no vistas, UTMOSv2 pasa de 2,72 a 2,70; y entre los modelos latentes, este es el mas natural, pero sigue por detras de v3.1.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia derivada, el repositorio completo (generador mas decodificador) ocupa 0,6 GB, por lo que los pesos caben holgadamente en GPUs de consumo; el consumo real depende de la implementacion y de la precision de ejecucion, que el autor no especifica.
- GPU recomendadas: no disponibles. El ejemplo de uso de la model card emplea `cuda`, sin indicar modelo de GPU concreto.
- GPU de consumo: por tamano de repositorio (0,6 GB), es esperable que quepa en GPUs de consumo con al menos 6-8 GB de VRAM, pero se trata de una estimacion, no de un requisito publicado.
- Opciones de despliegue: la libreria oficial `drifting-tts` (instalacion con el extra `dacvae` desde el repositorio Git de kadirnar) mediante la clase `Synthesizer`, que acepta un dispositivo (`"cuda"`) y un decodificador alternativo con el parametro `vocoder`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras. Arquitectonicamente el generador es de un solo paso (una evaluacion de red), lo que reduce el coste frente a TTS de difusion multi-paso, pero no hay mediciones publicadas.
- Nota de despliegue: si se usa el decodificador publicado en lugar de `dacvae_decoder_ft.pt`, la calidad se degrada severamente (WER del 9,55 %), por lo que el decodificador ajustado es obligatorio en la practica.

## Comparativa con modelos similares

| Modelo | Parametros | Espacio objetivo | WER (Freya-TR-Eval) | UTMOSv2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Vyvo/drifting-tts-tr v3.1 | no disponible | mel-espectrogramas | 0,66 % | 2,934 | CC BY 4.0 | Publicado; recomendado por el autor |
| Vyvo/drifting-tts-tr-dacvae (este) | no disponible | latentes DAC-VAE | 1,32 % | 2,710 | CC BY 4.0 (pesos); decodificador derivado de DAC-VAE, Apache-2.0 | Publicado; experimental |
| Vyvo/drifting-tts-tr-voxcpm2 | no disponible | latentes VoxCPM2 | 1,87 % | 2,530 | no disponible | Publicado |
| DAC-VAE latents con decodificador publicado | no disponible | latentes DAC-VAE | 9,55 % | 1,837 | Apache-2.0 (DAC-VAE, Meta) | Configuracion de ablacion, no recomendada |

No se dispone de datos de parametros ni de contexto para ninguno de los modelos comparados. La comparacion con familias de TTS ajenas al proyecto no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor: no es la version recomendada para produccion. Para maxima calidad debe usarse Vyvo/drifting-tts-tr v3.1, que obtiene mejor WER (0,66 % frente a 1,32 %), mejor CER y mejor UTMOSv2.
- Dependencia critica del decodificador ajustado: con el decodificador DAC-VAE publicado, el WER se dispara al 9,55 % y UTMOSv2 cae a 1,837. Desplegar sin `dacvae_decoder_ft.pt` inutiliza el modelo en la practica.
- Frecuencia de muestreo fija: el decodificador se ajusto contra grabaciones a 24 kHz; usar otra tasa de salida no esta soportado.
- Idiomas: unicamente turco. No hay capacidades multilingues documentadas, por lo que el uso con texto en otros idiomas no esta respaldado.
- Sesgos: no se documenta ningun analisis de sesgos de hablante, genero, edad o variedad dialectal del turco. Las voces disponibles son un conjunto cerrado (`studio`, `male`, `female`) mas identificadores enteros de hablante, sin informacion sobre su cobertura.
- Alucinacion y artefactos: no hay analisis especifico de fallos en texto fuera de dominio, numeros, siglas o palabras poco frecuentes; las metricas publicadas corresponden a 100 frases de Freya-TR-Eval con un unico hablante (722), lo que limita la generalizacion de los resultados.
- Marcado de agua no verificable: el decodificador inserta una marca de estilo AudioSeal en cada salida, pero Meta no ha publicado un detector, por lo que la deteccion no ha podido comprobarse. Esto condiciona cualquier uso del modelo para procedencia o atribucion.
- Licencia: los pesos del repositorio son CC BY 4.0, lo que exige atribucion y permite uso comercial, pero el decodificador ajustado es una obra derivada de DAC-VAE (Meta, Apache-2.0), por lo que deben respetarse tambien las condiciones de esa licencia al redistribuir el decodificador.
- Ausencia de datos operativos: no se publican requisitos de hardware, latencias, throughput ni opciones de cuantizacion, lo que dificulta planificar un despliegue en produccion.
- Validacion limitada: los resultados proceden de una unica evaluacion con configuracion fija (T = 0,3, alpha = 2, hablante 722, 100 frases) y con Whisper large-v3 como transcriptor de referencia; no hay evaluacion con oyentes humanos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vyvo/drifting-tts-tr-dacvae
- Modelo mel recomendado (v3.1): https://huggingface.co/Vyvo/drifting-tts-tr
- Variante con latentes VoxCPM2: https://huggingface.co/Vyvo/drifting-tts-tr-voxcpm2
- Demo comparativa en HuggingFace Spaces: https://huggingface.co/spaces/Vyvo/drifting-tts-tr-compare
- Repositorio de drifting-tts: https://github.com/kadirnar/drifting-tts
- Documentacion del espacio latente: https://github.com/kadirnar/drifting-tts/blob/main/docs/LATENTS.md
- Issue relacionada #32: https://github.com/kadirnar/drifting-tts/issues/32
- Paper de referencia (Deng et al., 2026): https://arxiv.org/abs/2602.04770
- Modelo base DAC-VAE (Meta): https://huggingface.co/facebook/dacvae-watermarked
- Resultados de busqueda web: no se han encontrado enlaces adicionales relevantes; las busquedas devolvieron unicamente resultados de la herramienta matematica GeoGebra, sin relacion con este modelo.
