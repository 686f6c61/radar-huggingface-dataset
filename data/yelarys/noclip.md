# yelarys/noclip

## Resumen

noclip es un modelo de mundo neuronal ("world model") interactivo desarrollado por el usuario independiente yelarys. Se trata de un transformer causal de 211 millones de parámetros que genera, fotograma a fotograma, una vista en primera persona de los Backrooms a partir de las entradas de teclado y ratón del jugador. El modelo funciona a 10 fotogramas por segundo en tiempo real sobre una única GPU, sin motor gráfico ni mapa subyacente: la imagen es enteramente inventada por la red.

El modelo se entrenó desde cero exclusivamente sobre un simulador procedural propio que recrea 18 niveles de los Backrooms. La arquitectura opera sobre latentes de vídeo de 16x9x32 obtenidos con un autoencoder DC-AE (factor de compresión 32x) a partir de vídeo de 512x288, con una anchura de 768, 16 capas y 12 cabezas de atención. La atención está factorizada en dos ejes (dentro de cada fotograma y entre fotogramas en la misma posición espacial), lo que reduce el coste computacional del contexto temporal.

Es relevante como demostración de modelos de mundo generativos aplicados a entornos interactivos en tiempo real con requisitos de hardware modestos (unos 3,1 GB de VRAM en juego). No obstante, es un proyecto secundario del autor, no un producto, y solo se ha evaluado frente a su propio simulador. La licencia es Apache 2.0 y el repositorio incluye el código, el simulador, el servidor de juego y los pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención factorizada (intra-fotograma e inter-fotograma en la misma posición); opera sobre latentes DC-AE |
| Parametros totales | 210.608.672 (modelo de mundo); el repositorio incluye además decodificador, codificador y lector de eventos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 24 fotogramas de ventana (2,4 s a 10 fps) más hasta 8 fotogramas de memoria recuperados por pose |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en float32) |
| Idiomas soportados | no disponible (modelo de vídeo/interacción, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, decoder.safetensors, encoder.safetensors, events.safetensors) |

## Arquitectura y entrenamiento

El núcleo es un transformer causal que procesa latentes de 16x9x32 obtenidos con un autoencoder DC-AE con compresión 32x sobre vídeo de 512x288 a 10 fps. La anchura es de 768, con 16 capas y 12 cabezas. La atención se factoriza en dos operaciones: una dentro de cada fotograma y otra entre fotogramas en la misma posición espacial, lo que abarata el modelado temporal. El modelo se condiciona por fotograma con 11 columnas de acción (movimiento, desplazamiento lateral, giro, inclinación, esprint, linterna, noclip, uso y tres columnas de estado) y con el nivel. Además de la ventana de 24 fotogramas, se le presentan hasta 8 fotogramas de memoria recuperados por pose de momentos anteriores del sueño.

El entrenamiento se realizó desde cero únicamente sobre el simulador del repositorio, en tres etapas (53M, 40M y 30M fotogramas, unos 123M en total) mientras el simulador crecía de 12 a 18 niveles; la última etapa muestreó ventanas de 16M fotogramas (440 horas de juego guionizado). Se usó flow matching con teacher forcing sobre contexto ligeramente ruidoso, y en la mitad de los lotes el contexto era la propia estimación de una pasada del modelo, lo que evita que el sueño derive de inmediato. El muestreo emplea 12 pasos de un integrador de segundo orden (Adams-Bashforth) por fotograma, sin guiado. Los pesos son una media móvil sobre rondas de entrenamiento. El cómputo fue de 6 a 11 GPU RTX 5000 Ada durante dos días.

## Capacidades

- Generación de vídeo interactivo en primera persona a 512x288 y 10 fps, fotograma a fotograma, en tiempo real.
- Respuesta a entradas de teclado y ratón: caminar (WASD), mirar con el ratón, correr (Shift), linterna (F), caer a otro nivel (N) y reiniciar el sueño (R).
- Condicionamiento por nivel: el modelo conoce 18 niveles de los Backrooms y genera la apariencia correspondiente a cada uno.
- Memoria a corto plazo: recupera hasta 8 fotogramas por pose de momentos anteriores para mantener la coherencia de lugares.
- Lectura de eventos: un pequeño módulo (events.safetensors) detecta golpes y muertes a partir de los latentes para disparar sonidos.
- No incluye capacidades de texto, código, matemáticas, visión general, tool calling ni agentes; es un modelo de mundo específico de dominio.

## Casos de uso

- Demostración e investigación en modelos de mundo: permite estudiar cómo un transformer aprende dinámica de entorno y control interactivo sin motor físico, sirviendo como banco de pruebas reproducible con el simulador incluido.
- Prototipado de experiencias interactivas generativas: un desarrollador puede experimentar con navegación en primera persona generada por red sin construir geometría ni assets, útil para validar conceptos de juego o arte generativo.
- Educación en generación de vídeo: el par codificador/decodificador DC-AE y el pipeline de flow matching sirven para enseñar compresión latente, atención factorizada y muestreo de segundo orden con código abierto.
- Investigación sobre coherencia temporal: los datos medidos (PSNR 26,7 dB al primer segundo y 17,3 dB a los doce segundos) permiten estudiar la deriva de modelos autorregresivos de vídeo y probar técnicas de memoria por pose.
- Generación de datos sintéticos de entornos: el codificador rápido (ConvNeXt-S entrenado para producir latentes DC-AE) y el simulador permiten crear conjuntos de datos de vídeo etiquetados con acciones para otros experimentos.
- Instalaciones artísticas o demos locales: con unos 4 GB de VRAM libre y Python 3.10+, se puede montar una experiencia jugable en una sola GPU consumer o de estación de trabajo, sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

Evaluación sobre 96 episodios reservados, mostrando 8 fotogramas grabados y luego solo las acciones grabadas (sin conducción humana), con 12 pasos de muestreo:

| Metrica | Valor |
|---|---|
| PSNR frente al simulador, primer segundo | 26,7 dB |
| PSNR a los doce segundos | 17,3 dB |
| Fotogramas en blanco entre 9 y 12 s (pared lisa, niebla, oscuridad) | 48 % (en los fotogramas del propio simulador: 12 %) |
| Tiempo por fotograma, RTX 5000 Ada, 12 pasos | 47 ms (el juego permite 100 ms) |
| Memoria de GPU durante el juego | 3,1 GB |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,1 GB durante el juego según el autor; se recomienda una GPU NVIDIA con aproximadamente 4 GB de memoria libre.
- GPU recomendadas: el autor midió 47 ms por fotograma en una RTX 5000 Ada; no se han publicado cifras para A100, H100 o RTX 4090.
- GPU consumer: cabe en tarjetas con 4 GB o más de VRAM libre, siempre que sean NVIDIA y compatibles con el stack de PyTorch del repositorio.
- Despliegue: el proyecto incluye su propio servidor de juego (`python -m wm.play`, servidor en http://127.0.0.1:8765/); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 47 ms por fotograma con 12 pasos de muestreo en RTX 5000 Ada, lo que deja margen frente al presupuesto de 100 ms por fotograma a 10 fps.
- Almacenamiento: el repositorio ocupa 2,2 GB e incluye modelo (842 MB), decodificador (1,07 GB), codificador (245 MB), lector de eventos, metadatos, fotogramas de inicio y vídeo de demostración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| noclip (yelarys) | 211M (modelo de mundo) | 24 fotogramas + 8 de memoria | Transformer causal sobre latentes DC-AE, flow matching, interactivo en tiempo real | Apache 2.0 | Pesos y código en HF y GitHub |
| Modelos de mundo interactivos tipo Genie/GameNGen | no disponible | no disponible | Generación de vídeo jugable condicionada por acciones | no disponible | no disponible en la información |
| Modelos de vídeo generativo generalistas (p. ej. Sora, Veo) | no disponible | no disponible | Difusión sobre vídeo de alta resolución | propietaria | API/servicio |

No se dispone de datos verificables en la información proporcionada para establecer una comparación cuantitativa con alternativas concretas; las filas distintas de noclip se indican como no disponibles.

## Limitaciones y advertencias

- Coherencia temporal limitada: un nivel se mantiene como lugar durante decenas de segundos; cuando la imagen se disuelve, el servidor de juego traslada al jugador a otro nivel.
- Control parcial: caminar y mirar se obedecen, pero puertas y entidades aparecen sin fiabilidad bajo petición.
- Memoria espacial muy corta: los lugares se recuerdan por momentos, no tras recorrer una manzana.
- Deriva medible: el PSNR cae de 26,7 dB al primer segundo a 17,3 dB a los doce segundos, y los fotogramas en blanco suben al 48 % frente al 12 % del simulador.
- Estilo fijo: reproduce la estética del simulador (512x288, 10 fps, texturas procedurales), sin capacidad de generalizar a otros dominios visuales.
- Evaluación limitada: solo se ha evaluado frente a su propio simulador; no hay benchmarks con terceros ni comparaciones publicadas.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse solo con un simulador procedural hereda sus limitaciones de variedad visual y de representación.
- Riesgo de alucinación visual: al ser un modelo generativo autorregresivo, puede inventar geometría y objetos inconsistentes, especialmente en sueños largos.
- Licencia: Apache 2.0 permite uso comercial, pero el decodificador deriva de `mit-han-lab/dc-ae-lite-f32c32-sana-1.1-diffusers` (MIT HAN Lab y NVIDIA) y conviene revisar sus términos; el proyecto no está afiliado a ninguna película, juego o wiki de los Backrooms.
- Madurez: es un proyecto secundario, no un producto, sin garantías de soporte ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yelarys/noclip
- Repositorio de código, simulador, entrenamiento y servidor de juego: https://github.com/Yelar/noclip
- Vídeo de demostración: https://huggingface.co/yelarys/noclip/resolve/main/demo.mp4
- Autoencoder base del decodificador: https://huggingface.co/mit-han-lab/dc-ae-lite-f32c32-sana-1.1-diffusers
- Paper del autoencoder DC-AE: arXiv:2410.10733 (Chen et al., 2024), https://arxiv.org/abs/2410.10733
