# xingguangcuican6666/plana-gptsovits-v2

## Resumen

plana-gptsovits-v2 es un modelo de sintesis de voz (text-to-speech) y clonacion de voz basado en el framework GPT-SoVITS v2, publicado por el usuario xingguangcuican6666 en Hugging Face. No es un modelo de lenguaje general, sino un conjunto de pesos de fine-tuning acustico y semantico que reproduce la voz del personaje Plana (普拉娜 / プラナ), perteneciente al videojuego Blue Archive. El repositorio contiene unicamente los checkpoints entrenados, que deben cargarse sobre la implementacion oficial de GPT-SoVITS para poder sintetizar audio.

Tecnicamente se compone de dos piezas complementarias: un modulo GPT en su variante v2Pro (24 capas, hidden de 512, ~148 MB) que modela la correspondencia entre texto y representaciones semanticas, y un modulo SoVITS v2 (6 capas, inter_channels 192, ~81 MB) que actua como modelo acustico y vocoder. El entrenamiento se realizo sobre un corpus muy reducido: 29 lineas de dialogo en chino (aproximadamente 1 MB), partiendo de los pesos preentrenados gsv-v2final-pretrained del propio proyecto GPT-SoVITS. Los pesos se distribuyen como ficheros PyTorch (.ckpt y .pth), no en safetensors ni GGUF, y el repositorio ocupa 0,2 GB.

Su relevancia es acotada y muy especifica: sirve como ejemplo de fine-tuning de voz con pocos datos y como recurso para la comunidad de doblaje amateur y contenido derivado de Blue Archive. No obstante, al tratarse de un repositorio con 0 descargas y 0 likes en el momento de la consulta, con un dataset de entrenamiento extremadamente pequeno y con un personaje sujeto a derechos de autor de terceros, debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2 (dos etapas: GPT v2Pro para texto/semantica + SoVITS v2 para acustica y vocoder) |
| Parametros totales | no disponible (la model card no publica el recuento; se indican 24 capas y hidden 512 para el modulo GPT, y 6 capas con inter_channels 192 para SoVITS) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo TTS; la longitud viene determinada por la frase de texto y la referencia de audio) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en precision FP16, segun los hiperparametros de entrenamiento) |
| Idiomas soportados | chino (zh) |
| Licencia | MIT (repositorio de pesos); el autor remite ademas a la licencia de GPT-SoVITS y al respeto de los derechos del personaje |
| Formato de pesos | PyTorch: `plana-e15.ckpt` (GPT v2Pro, ~148 MB) y `plana_e8_s232.pth` (SoVITS v2, ~81 MB) |
| Frecuencia de muestreo | 32 kHz, mel de 128 canales |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de dos etapas de GPT-SoVITS v2. La primera etapa (s1) es un modulo GPT de tipo transformer autorregresivo que traduce la secuencia de texto, tokenizada a nivel de fonema y enriquecida con caracteristicas de un modelo BERT chino, en tokens semanticos de audio. Para esta ficha se emplea la variante v2Pro, configurada con 24 capas y dimension oculta de 512. La segunda etapa (s2) es el modelo SoVITS, un sistema acustico con 6 capas e inter_channels de 192 que convierte esas representaciones en un mel-espectrograma de 128 canales a 32 kHz, del que se obtiene la forma de onda final. La clonacion de voz se consigue condicionando la sintesis con un fragmento de audio de referencia y su transcripcion, de modo que la identidad vocal se transfiere sin necesidad de reentrenar.

El entrenamiento partio de los pesos preentrenados oficiales `gsv-v2final-pretrained` (checkpoint s1 `s1bert25hz-5kh-longer-epoch=12-step=369668.ckpt` y modelos s2 `s2G2333k.pth` y `s2D2333k.pth`) y se realizo un fine-tuning sobre un corpus propio de 29 frases en chino de Plana, de aproximadamente 1 MB. Los checkpoints publicados corresponden a 15 epocas en el modulo GPT y 8 epocas en SoVITS. El entrenamiento se ejecuto en una unica GPU (GPU 0) con precision FP16, con un learning rate global inicial de 1e-4, 2000 pasos de warmup y decaimiento coseno hasta 1e-4. La model card no documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales; tampoco describe innovaciones propias mas alla del fine-tuning sobre el framework existente.

## Capacidades

- Sintesis de voz en chino con la identidad vocal del personaje Plana, a partir de texto y un audio de referencia.
- Clonacion de voz few-shot dentro del paradigma GPT-SoVITS: no requiere reentrenamiento en tiempo de inferencia, solo seleccionar los pesos y aportar una muestra de referencia.
- Modelado de prosodia y timbre mediante el modulo GPT v2Pro, con generacion de mel-espectrograma a 32 kHz por parte de SoVITS.
- Integracion con el WebUI y la API de GPT-SoVITS, lo que permite invocacion programatica por HTTP.
- Soporte multilingue: limitado al chino segun la metadata del repositorio; no se declaran capacidades en otros idiomas.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: no es un modelo de lenguaje.
- No incorpora capacidades de vision, audio de entrada distinto a la referencia vocal, ni procesamiento de documentos.
- La model card declara la metrica `accuracy`, pero no publica ningun valor asociado.

## Casos de uso

- Doblaje amateur de contenido derivado de Blue Archive: el modelo permite generar lineas nuevas con la voz de Plana a partir de un guion en chino y un fragmento de referencia, sin necesidad de grabar al actor original.
- Mods y parches de voz para videojuegos: la comunidad puede sustituir o ampliar clip sets de personaje en mods de PC, usando la API de GPT-SoVITS para generar lotes de frases desde una lista de texto.
- Creacion de contenido para YouTube o Bilibili: narraciones o sketchs con la voz del personaje, generados por lotes y montados en edicion posterior.
- Prototipado de asistentes conversacionales con voz de personaje: combinando el modelo con un LLM externo y un sistema de texto a voz encadenado, se puede construir un bot de chat con la identidad vocal de Plana para demos o eventos.
- Generacion de audio para Visual Novels o proyectos fan: produccion de lineas de dialogo a partir de un guion, reduciendo la dependencia de un actor de voz para pruebas de concepto.
- Aumento de datos para investigacion en TTS: el par GPT/SoVITS puede emplearse como caso de estudio de fine-tuning con corpus minimos (29 frases, ~1 MB) y analizar el grado de sobreajuste resultante.
- Pruebas de integracion de GPT-SoVITS en pipelines propios: sirve como ejemplo funcional de carga de pesos v2Pro + v2 y de invocacion via API dentro de un flujo automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara la metrica `accuracy` en la seccion de metadata, sin acompanarla de ningun valor numerico, de un conjunto de evaluacion ni de una comparacion con otros modelos. Tampoco se aportan mediciones de MOS (Mean Opinion Score), similitud de hablante (SECS) ni tasas de error de sintesis.

## Requisitos de hardware

- La model card no especifica requisitos de hardware. Como referencia del framework GPT-SoVITS v2 en inferencia FP16, el conjunto completo (modelo BERT de texto, modulo GPT y modulo SoVITS) suele operar en el orden de 4 a 6 GB de VRAM; se trata de una estimacion general del framework, no de un dato confirmado por el autor.
- El peso de los checkpoints es reducido: aproximadamente 148 MB para el modulo GPT y 81 MB para SoVITS, unos 229 MB en total.
- Cabe en GPU de consumo: tarjetas con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4090) son suficientes para inferencia segun las estimaciones anteriores. La model card no confirma compatibilidad con ninguna GPU concreta.
- El entrenamiento documentado se realizo en una unica GPU con precision FP16; no se indica el modelo de GPU empleado.
- Opciones de despliegue: el autor indica explicitamente el uso del repositorio GPT-SoVITS (RVC-Boss) mediante su WebUI o su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de sintesis ni de RTF (real-time factor).

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otros modelos. La siguiente tabla recoge unicamente los datos verificables del repositorio y deja como no disponibles los campos que no se han podido confirmar; no se aportan cifras de rendimiento de terceros.

| Modelo | Tipo | Parametros | Idiomas | Licencia | Formato | Contexto / ventana |
|---|---|---|---|---|---|---|
| plana-gptsovits-v2 (este modelo) | Fine-tuning TTS sobre GPT-SoVITS v2 | no disponible (24 capas/hidden 512 en GPT; 6 capas/192 en SoVITS) | chino | MIT en el repositorio, con reservas sobre derechos del personaje | .ckpt + .pth (PyTorch) | no aplica |
| GPT-SoVITS v2 (framework base, gsv-v2final-pretrained) | Framework TTS y clonacion de voz | no disponible | chino, ingles, japones y otros segun la version del proyecto | MIT (segun el repositorio del proyecto) | .ckpt + .pth (PyTorch) | no aplica |
| Otros fine-tunings de personaje sobre GPT-SoVITS | Fine-tuning TTS | no disponible | segun el autor | variable | .ckpt + .pth | no aplica |

## Limitaciones y advertencias

- Corpus de entrenamiento minimo: 29 frases y aproximadamente 1 MB de audio en chino. Es un volumen muy bajo, con riesgo alto de sobreajuste y de cobertura pobre de prosodia, enfasis, emociones y contextos foneticos no vistos.
- Idioma unico: el modelo solo declara soporte para chino. Su comportamiento con texto en otros idiomas no esta documentado y previsiblemente sera deficiente.
- Licencia y derechos de terceros: aunque la metadata del repositorio indica licencia MIT, el propio autor remite a la licencia de GPT-SoVITS y exige respetar los derechos del personaje. La voz de Plana esta asociada a Blue Archive, propiedad de sus titulares, por lo que el uso comercial del timbre clonado puede infringir derechos de imagen o de voz independientemente de la licencia del codigo o de los pesos.
- Riesgo de suplantacion: al ser un modelo de clonacion de voz, puede emplearse para generar audio atribuible falsamente a una persona o a un actor de voz. Es necesario contar con consentimiento y cumplir la normativa aplicable sobre sintesis de voz.
- Sin datos de evaluacion: no hay MOS, SECS ni ninguna otra metrica publicada, por lo que la calidad real de la sintesis no puede verificarse sin pruebas propias.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Riesgo de alucinacion en el contexto acustico: en modelos generativos de audio, entradas fuera de distribucion pueden producir artefactos, ruido, pronunciaciones incorrectas o inestabilidad prosodica; no existe documentacion del autor sobre este comportamiento.
- Dependencia estricta de versiones: la model card advierte que el modulo GPT (.ckpt) y el modulo SoVITS (.pth) deben cargarse conjuntamente y con versiones compatibles (v2Pro y v2 respectivamente). Una combinacion incorrecta puede impedir la inferencia.
- Fechas de publicacion inusuales: la metadata indica creacion y actualizacion en 2026-09-17, dato que conviene verificar directamente en Hugging Face.
- No es un modelo de lenguaje: no debe emplearse para generacion de texto, codigo, matematicas, vision ni tareas de razonamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xingguangcuican6666/plana-gptsovits-v2
- Repositorio oficial de GPT-SoVITS (framework requerido para la inferencia): https://github.com/RVC-Boss/GPT-SoVITS
- Pesos preentrenados de referencia citados por el autor: `gsv-v2final-pretrained` (s1 `s1bert25hz-5kh-longer-epoch=12-step=369668.ckpt`, s2 `s2G2333k.pth` y `s2D2333k.pth`), distribuidos en el ecosistema del proyecto GPT-SoVITS
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las coincidencias devueltas corresponden a paginas no relacionadas (articulos sobre la letra griega mu, portales de universidades y el videojuego MU Online) y no aportan informacion tecnica utilizable.
