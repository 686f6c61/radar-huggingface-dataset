# tablinum/Lite-Beam-1.2B

## Resumen

Lite-Beam 1.2B es una cuantización GGUF de precisión mixta del modelo LiquidAI/LFM2.5-1.2B-Instruct, publicada por el usuario tablinum bajo el marco de trabajo de su herramienta terrabeam. No se trata de un cuantizado estándar generado con una única bandera de `llama.cpp`, sino de un mapa de tensores construido a mano en el que cada tensor sensible recibe una cota mínima de precisión y el resto se asigna al escalón más bajo seguro. El resultado es un fichero de 542 MiB que, según el autor, iguala estadísticamente la precisión del cuantizado estándar Q3_K_M (4,1 bpw) siendo un 5,3 % más pequeño.

El modelo base es un transformer de 1.170.340.608 parámetros (1,2B) desarrollado por Liquid AI, orientado a inferencia local y en el borde (edge), con licencia LFM Open v1.0. Lite-Beam hereda las capacidades del modelo base y añade una capa de cuantización optimizada para entornos con poca VRAM, CPU y despliegues totalmente offline. Se distribuye únicamente en formato GGUF para `llama.cpp`, con dos escalones de precisión medidos: 3,89 bpw y 4,80 bpw.

Su relevancia actual radica en la combinación de tamaño reducido, consumo de VRAM por debajo de 1 GiB y una metodología de cuantización reproducible y documentada con intervalos de confianza, algo poco habitual en publicaciones de cuantizados. Está pensado para desarrolladores que necesitan un modelo conversacional capaz en hardware modesto (portátiles, tarjetas de 6 GiB, servidores sin GPU) sin renunciar a una calidad medible frente al modelo original en F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI LFM2.5-1.2B-Instruct); cuantizacion GGUF para llama.cpp |
| Parametros totales | 1.170.340.608 (1,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens en la configuracion de benchmark; longitud maxima del modelo base no disponible |
| Tipos de cuantizacion | GGUF con mapa de tensores mixto; dos escalones publicados: 3,885 bpw (Lite-Beam 3.89) y 4,80 bpw (Lite-Beam 4.80); V de atencion fijada en Q5_K, embeddings en Q4_K o superior, primer y ultimo bloque un escalon por encima |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (license_name: lfm-open-license-v1.0) |
| Formato de pesos | GGUF (llama.cpp); repo de 1,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo LiquidAI LFM2.5-1.2B-Instruct, un transformer de 1,2B parámetros del que no se detallan en la información disponible la composición del dataset, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO. Lite-Beam no reentrena ni modifica los pesos: es un proceso de cuantización post-entrenamiento que reasigna precisiones por tensor.

La innovación técnica de Lite-Beam reside en el mapa de tensores. En lugar de aplicar una regla uniforme de bits por peso, el autor impone suelos de precisión en tensores sensibles: la matriz V de atención se fija en Q5_K en todas las capas, los embeddings se mantienen en Q4_K o superior y el primer y el último bloque reciben un escalón adicional de precisión. El resto de tensores se asigna al escalón más bajo que no degrade la calidad medida. El mapa exacto de tensores se distribuye en el repositorio junto con su hash, lo que permite reconstruir el fichero byte a byte. La evaluación se realizó con un instrumento congelado de 2.500 preguntas de opción múltiple con respuesta de letra única, extraídas de MMLU-Pro, GPQA y BBH, usando `llama-server -ngl 99`, contexto de 2.048, 12 hilos y argmax sobre letras A–J, con retención medida frente a la ejecución F16 del mismo modelo sobre los mismos ítems y reportada con intervalos de confianza bootstrap.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat compatible con el modelo base Instruct.
- Razonamiento de opción múltiple y tareas de conocimiento evaluadas sobre MMLU-Pro, GPQA y BBH.
- Inferencia totalmente offline y local, sin dependencia de servicios externos.
- Integración con API estilo OpenAI mediante la herramienta terrabeam en `http://127.0.0.1:8080/v1`.
- Compatibilidad con proxys hacia Ollama, LM Studio y vLLM mediante `terrabeam proxy --upstream`.
- Memoria persistente opcional mediante `--memory long-term` en terrabeam.
- Inyección de pasajes de la librería Tablinum en cada consulta (el modelo pequeño aporta el razonamiento; la librería aporta el conocimiento).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Capacidades de visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional en el borde: el modelo ocupa 542 MiB en disco y picos de 0,659 GiB de VRAM a 2.048 de contexto, por lo que puede ejecutarse en portátiles con GPU de 6 GiB o incluso en CPU con 12 hilos (153 tokens/s de prefill y 48 tokens/s de decodificación), ofreciendo respuestas conversacionales sin conexión.
- Despliegue en entornos air-gapped: al ser un GGUF offline con licencia LFM Open v1.0, puede instalarse en máquinas sin acceso a red para tareas de clasificación, resumen o respuesta a preguntas sobre documentación interna.
- Backend de chat para herramientas de desarrollo: la integración con Claude Code, Cursor y Open WebUI mediante el proxy de terrabeam permite usar el modelo como backend local de asistentes de código, aprovechando la API compatible con OpenAI.
- Evaluación de opción múltiple automatizada: el protocolo de benchmark con respuesta forzada de letra única y argmax sobre A–J es directamente reutilizable para construir pipelines de evaluación de modelos pequeños sobre MMLU-Pro, GPQA o BBH en hardware modesto.
- Servicio de atención al cliente de bajo coste: con 660 MiB de VRAM y 217 tokens/s en una GPU de portátil de 6 GiB, puede atender conversaciones multi-turno en inglés en un servidor de gama baja o en un equipo de escritorio, manteniendo el contexto dentro de los 2.048 tokens de la configuración medida.
- Prototipado rápido en CI/CD: al ser un fichero de 542 MiB con reconstrucción reproducible y hash del mapa de tensores, encaja en pipelines que necesitan un modelo de referencia ligero para pruebas de regresión de calidad de cuantización.
- Investigación sobre cuantización: el repositorio incluye los resultados por ítem del benchmark y el mapa de tensores exacto, lo que permite reproducir y comparar metodologías de cuantización mixta frente a cuantizados uniformes de llama.cpp.

## Benchmarks y rendimiento

Instrumento: 2.500 ítems de opción múltiple con respuesta de letra única extraídos de MMLU-Pro, GPQA y BBH. Protocolo: `llama-server -ngl 99`, contexto 2.048, 12 hilos, prefijo de respuesta forzado, argmax sobre letras A–J. Retención medida frente a la ejecución F16 del mismo modelo sobre los mismos ítems.

| Escalon | bpw | Tamano | Aciertos / 2500 | Retencion | IC 95% | Ratio PPL in-dist | VRAM pico |
|---|---:|---:|---:|---:|---|---:|---:|
| Lite-Beam 3.89 | 3,885 | 0,529 GiB | 641 | — | — | — | 0,659 GiB |
| Lite-Beam 4.80 | 4,80 | no disponible | no disponible | indistinguible de F16 (p = 0,081) | — | — | 0,783 GiB |
| Q3_K_M estandar de llama.cpp | 4,1 | 0,559 GiB | 630 | — | — | — | no disponible |

Comparación pareada Lite-Beam 3.89 frente a Q3_K_M: +0,0044 de precisión, p = 0,60 (empate estadístico) con un 5,3 % menos de bytes. Rendimiento en CPU (12 hilos, 3,89 bpw): 153 tokens/s de prefill y 48 tokens/s de decodificación. Rendimiento en GPU de portátil de 6 GiB: 217 tokens/s.

## Requisitos de hardware

- VRAM estimada: 0,659 GiB de pico a 2.048 de contexto para el escalón 3,89 bpw; 0,783 GiB para el escalón 4,80 bpw.
- GPU recomendadas: cualquier GPU con al menos 1 GiB libre; el autor cita una tarjeta de portátil de 6 GiB como referencia (217 tokens/s). GPU de clase A100, H100 o RTX 4090 no son necesarias y no se han reportado mediciones sobre ellas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con 2 GiB o más de VRAM; también en iGPU y en CPU.
- CPU: 153 tokens/s de prefill y 48 tokens/s de decodificación con 12 hilos a 3,89 bpw.
- Opciones de despliegue: `llama.cpp` (librería nativa del modelo), `llama-server`, terrabeam (instalador y servidor con API estilo OpenAI), proxy hacia Ollama, LM Studio y vLLM mediante `terrabeam proxy`.
- Latencia y throughput: 217 tokens/s en GPU de portátil de 6 GiB; 48 tokens/s de decodificación en CPU de 12 hilos. No se han publicado mediciones en A100, H100 ni RTX 4090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Lite-Beam 1.2B (3.89) | 1,2B | 2.048 (config. medida) | GGUF | LFM Open v1.0 | 0,529 GiB, 641/2500 en el benchmark del autor |
| Q3_K_M de LFM2.5-1.2B-Instruct | 1,2B | 2.048 (config. medida) | GGUF | LFM Open v1.0 | 0,559 GiB, 630/2500, empate estadístico con Lite-Beam |
| Lite-Beam 1.2B (4.80) | 1,2B | 2.048 (config. medida) | GGUF | LFM Open v1.0 | Calidad indistinguible de F16 (p = 0,081), 0,783 GiB de VRAM |
| LFM2.5-1.2B-Instruct F16 | 1,2B | no disponible | safetensors | LFM Open v1.0 | Referencia de retención del benchmark |

No se dispone de comparaciones con otros modelos de 1,2B de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según los metadatos del modelo; no se ha verificado comportamiento en castellano ni en otros idiomas.
- El benchmark del autor mide únicamente opción múltiple con respuesta de letra única sobre MMLU-Pro, GPQA y BBH; no hay datos publicados sobre generación abierta, código, matemáticas o tool calling.
- El contexto medido es de 2.048 tokens; la longitud máxima real del modelo base no está disponible en la información proporcionada.
- Riesgo de alucinación inherente a un modelo de 1,2B parámetros; el autor mitiga esto inyectando pasajes de la librería Tablinum en cada consulta, lo que implica que el conocimiento no reside principalmente en los pesos.
- La licencia LFM Open v1.0 es una licencia "other" que debe revisarse antes de uso comercial; no se detallan en la información disponible las restricciones concretas de atribución, redistribución o uso comercial.
- El empate estadístico con Q3_K_M (p = 0,60) no implica superioridad; la ventaja declarada es de tamaño (5,3 % menos bytes), no de calidad.
- El ecosistema de herramientas asociado (terrabeam) es un proyecto del mismo autor, con un script de instalación remoto; conviene auditar el script antes de ejecutarlo en producción.
- El repositorio tiene 179 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía muy limitada.
- El modelo base y la cuantización están pensados para inferencia local; no se han publicado datos de throughput en GPUs de centro de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Lite-Beam-1.2B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Documentación de integración con harnesses: https://github.com/chadstthomas-svg/terrabeam/blob/master/docs/harnesses.md
- Script de instalación (Unix): https://raw.githubusercontent.com/chadstthomas-svg/terrabeam/master/install.sh
- Script de instalación (Windows): https://raw.githubusercontent.com/chadstthomas-svg/terrabeam/master/install.ps1
