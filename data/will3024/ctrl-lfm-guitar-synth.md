# Will3024/ctrl-lfm-guitar-synth

## Resumen

Ctrl-lfm-guitar-synth es un sistema de sintesis expresiva de guitarra desarrollado por Hsueh-Wei Fu (Universidad Nacional de Taiwan) como parte de un proyecto de investigacion. No se trata de un modelo de lenguaje, sino de una cadena de tres modelos congelados que transforman partituras (GuitarPro, MusicXML o MIDI) en curvas de interpretacion expresiva y, finalmente, en audio de guitarra acustica o electrica en solo. El nombre del proyecto hace referencia al "controllable latent flow matching": la etapa de sintesis usa flujo rectificado en el espacio latente para generar audio.

El sistema se apoya en stabilityai/stable-audio-open-1.0 como codificador/decodificador latente congelado (SAO3), y anade tres etapas entrenadas a medida: un predictor de ganancia por nota, un regresor de envolventes y un sintetizador conjunto de seis cuerdas. Los pesos publicados en este repositorio de Hugging Face son exactamente los que reproducen los scripts de entrenamiento del repositorio de codigo asociado.

Su relevancia radica en que aborda un problema concreto y dificil: convertir una partitura simbolica en una interpretacion expresiva realista de guitarra, controlando el matiz por nota (loudness, envolventes, curvas de pitch), algo que los sintetizadores tradicionales basados en MIDI resuelven de forma poco natural. El modelo fue entrenado sobre GuitarSet, el dataset de referencia para transcripcion de guitarra (ISMIR 2018).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cadena de tres modelos: predictor de ganancia por nota, regresor de envolventes y sintetizador conjunto con flujo rectificado (rectified flow) en espacio latente |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, sin cuantizacion publicada) |
| Idiomas soportados | no aplicable (modelo de audio; entrada: partituras GuitarPro/MusicXML/MIDI) |
| Licencia | CC BY 4.0 (con dependencia upstream bajo Stability AI Community License) |
| Formato de pesos | .pt (PyTorch checkpoints) |

## Arquitectura y entrenamiento

El sistema se compone de tres modelos congelados encadenados en pipeline. La etapa 1 es un predictor de ganancia por nota que estima la sonoridad de cada nota a partir de la partitura. La etapa 2 es un regresor de envolventes que, condicionado en la partitura y la sonoridad, genera curvas de pitch y envolvente (expresividad de la interpretacion). La etapa 3 es un sintetizador conjunto de seis cuerdas que convierte esas curvas en latentes de audio mediante flujo rectificado (rectified flow), una variante de flow matching. Existe ademas un post-proceso opcional de mezcla y reverberacion que combina las seis cuerdas secas en una senal de dominio de microfono unico.

Los pesos se entrenaron sobre GuitarSet (Xi et al., ISMIR 2018), el dataset estandar de guitarra con grabaciones anotadas de guitarra acustica y electrica. El decodificador/codificador latente procede de stabilityai/stable-audio-open-1.0 y permanece congelado durante el entrenamiento. El repositorio incluye tambien un baseline de ablacion que condiciona la sintesis unicamente en pitch MIDI plano y pseudo-velocidad de pico, util para comparar la contribucion de las curvas expresivas. No se ha publicado informacion sobre el numero de pasos de entrenamiento ni el hardware empleado.

## Capacidades

- Sintesis de audio de guitarra en solo (acustica y electrica) a partir de partituras simbolicas en formatos GuitarPro, MusicXML y MIDI.
- Prediccion de sonoridad (loudness) por nota desde la partitura, para dotar de dinamica musical a la interpretacion.
- Regresion de curvas expresivas: pitch bends y envolventes de amplitud por nota, capturando tecnicas de interpretacion de guitarra.
- Sintesis conjunta de las seis cuerdas de la guitarra de forma simultanea, en lugar de nota a nota.
- Post-procesado opcional de mezcla y reverberacion que emula una captacion de microfono unica.
- Pipeline audio-to-audio clasificado en Hugging Face, con inferencia por linea de comandos desde el repositorio de codigo.
- No soporta tool calling, agentes ni razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Renderizado de partituras de guitarra con expresividad realista: un compositor puede convertir sus ficheros GuitarPro o MusicXML en audio interpretable sin programar automation de velocity ni curvas manuales, ya que el sistema predice la sonoridad y las envolventes por nota.
- Prototipado rapido de arreglos para guitarra: permite escuchar como sonaria un arreglo antes de grabarlo, gracias a la inferencia por linea de comandos sobre ficheros de ejemplo.
- Produccion musical asistida: las curvas de pitch y envolvente generadas pueden usarse como material de partida para editar y refinar en un DAW.
- Investigacion en sintesis simbolica-a-audio: los checkpoints de ablacion (sintesis condicionada solo en pitch y velocidad de pico) permiten estudiar el impacto de las curvas expresivas en la calidad percibida.
- Generacion de demos y contenido educativo: producir audio de referencia para tutoriales, transcripciones o materiales didacticos de guitarra con licencia CC BY 4.0 (con atribucion).
- Evaluacion de modelos de transcripcion o generacion simbolica: convertir la salida de un modelo generador de MIDI en audio realista para evaluacion subjetiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio enlaza una demo de escucha (listening demo) en la pagina del proyecto, pero no incluye metricas cuantitativas (FAD, KLD, ni evaluaciones subjetivas MOS).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo pesa 0,4 GB, y la inferencia requiere ademas descargar stabilityai/stable-audio-open-1.0 en tiempo de ejecucion, por lo que una GPU de consumo con 8-16 GB de VRAM (por ejemplo RTX 3060 o superior) es razonable como estimacion, aunque sin confirmacion oficial.
- GPU recomendadas: no disponible; los comandos de ejemplo usan `CUDA_VISIBLE_DEVICES=0`, lo que indica inferencia en una unica GPU.
- Consumer GPUs: probablemente suficiente con una GPU de gama media, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: script de inferencia propio (`python -m inference.infer`) del repositorio de codigo; no hay integracion documentada con vLLM, llama.cpp, Ollama o TGI (no aplicable a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| ctrl-lfm-guitar-synth | Partitura -> audio de guitarra expresiva | Flow matching latente + cadenas de predictores | CC BY 4.0 (upstream: Stability AI Community License) | Pesos publicos en Hugging Face, codigo en GitHub |
| stabilityai/stable-audio-open-1.0 | Texto/condicion -> audio generico | DiT latente sobre audio | Stability AI Community License | Pesos publicos, modelo gated |
| MIDI-DDSP (Google Magenta) | MIDI -> interpretacion sintetizada expresiva | DDSP + modelos jerarquicos de performance | Apache 2.0 | Codigo y pesos publicos |
| SoundStream/MusicGen (Meta) | Generacion de musica condicionada | Transformer autoregresivo sobre tokens de audio | Pesos no comerciales (CC-BY-NC) | Pesos publicos con restricciones |

La diferencia clave es que ctrl-lfm-guitar-synth ofrece control simbolico fino (nota a nota, cuerda a cuerda) sobre un instrumento concreto, mientras que alternativas como MusicGen generan musica desde descripciones de texto sin control por nota.

## Limitaciones y advertencias

- Restriccion de dominio: el sistema esta entrenado solo para guitarra en solo (acustica y electrica); no generaliza a otros instrumentos ni a conjuntos.
- Dependencia de licencia upstream: la inferencia exige descargar stabilityai/stable-audio-open-1.0, regido por la Stability AI Community License, gratuita solo para organizaciones e individuos con menos de 1 millon USD de ingresos anuales; por encima hace falta una licencia empresarial de Stability AI. Hay que aceptar el modelo gated en Hugging Face con `huggingface-cli login` antes de usar `HF_TOKEN`.
- El audio generado queda ademas sujeto a la Acceptable Use Policy de Stability AI, ademas de los terminos CC BY 4.0 del repositorio.
- Obligacion de atribucion: CC BY 4.0 exige citar este repositorio y GuitarSet en cualquier uso, incluido el comercial.
- Cero descargas registradas y un solo like en Hugging Face: proyecto de investigacion sin comunidad consolidada ni soporte garantizado.
- No hay metricas de calidad publicadas; la evaluacion debe hacerse mediante la demo de escucha o pruebas propias.
- Riesgo de artefactos de audio tipico de modelos generativos de sintesis; no se documenta su comportamiento ante partituras fuera de distribucion (tecnicas extendidas, afinaciones no estandar).
- Informacion tecnica incompleta: numero de parametros, tiempo de entrenamiento y requisitos de VRAM no estan publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Will3024/ctrl-lfm-guitar-synth
- Repositorio de codigo en GitHub: https://github.com/WeiFu3024/ctrl-lfm-guitar-synth
- Demo de escucha: https://weifu3024.github.io/ctrl-lfm-guitar-synth/
- Modelo base (codificador/decodificador latente): https://huggingface.co/stabilityai/stable-audio-open-1.0
- Dataset GuitarSet: https://zenodo.org/records/3371780
