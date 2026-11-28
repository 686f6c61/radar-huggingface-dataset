# youyouyouyou/syki-ghost

## Resumen

syki-ghost es un modelo de autocompletado inline en japones (ghost text) derivado de `sbintuitions/sarashina2.2-0.5b`, desarrollado por el usuario `youyouyouyou` y publicado bajo licencia MIT. Su proposito no es la generacion de texto generalista ni el razonamiento, sino predecir la siguiente frase mientras el usuario escribe en un editor, mostrando la sugerencia en gris y permitiendo aceptarla con la tecla Tab. Esta disenado exclusivamente para integrarse en syki, un editor Markdown nativo de Windows escrito en Rust con WebView2.

El modelo parte de un transformer de 416.851.200 parametros (aproximadamente 0,5B) y se ha comprimido mediante poda estructurada de capas (de 24 a 16), recorte del vocabulario japones a 24k tokens, destilacion de conocimiento sobre datos abiertos con Unlikelihood Loss y cuantizacion imatrix IQ3_XXS. El resultado es un unico fichero GGUF de 178,21 MB que, segun el autor, alcanza una latencia P50 de 85 ms en CPU de 4 hilos y un arranque en frio de unos 470 ms, con un consumo de memoria de aproximadamente 300 MB.

Su relevancia actual es acotada pero clara: demuestra que un modelo de prediccion de texto util para escritura en japones puede ejecutarse completamente offline en un portatil sin GPU, sin enviar datos a servidores externos. Es una pieza de infraestructura de producto mas que un modelo de proposito general, y debe evaluarse con ese marco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de sarashina2.2-0.5b), con poda estructurada de 24 a 16 capas |
| Parametros totales | 416.851.200 (modelo base); el fichero GGUF distribuido no declara recuento exacto tras la poda |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (valor usado en los comandos de ejemplo y en el benchmark) |
| Tipos de cuantizacion | IQ3_XXS con calibracion imatrix (unico fichero publicado) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (`syki-ghost-v3.1.gguf`, 178,21 MB, SHA-256 `3b9ffc23b43720b922e1519f5e9ff4a2d8c0f9f697d2cbbda5e11d8e55cb56f7`) |

## Arquitectura y entrenamiento

La base es `sbintuitions/sarashina2.2-0.5b`, un transformer decoder-only de 0,5B parametros de SB Intuitions bajo licencia MIT. Sobre esa base el autor aplica cuatro transformaciones principales: poda estructurada de capas (24 a 16), recorte del vocabulario japones a 24k tokens, destilacion de conocimiento usando datos abiertos y sinteticos, y una etapa con Unlikelihood Loss orientada a suprimir continuaciones degeneradas (repeticiones y bucles). Finalmente se cuantiza a IQ3_XXS con calibracion imatrix, lo que explica el tamano de 178 MB.

El autor declara que tanto el entrenamiento como la destilacion y la calibracion de la cuantizacion usan exclusivamente datos abiertos y sinteticos. No se publican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla la innovacion de decodificacion mas alla de los parametros recomendados (`temperature=0.0`, `max_tokens=24`, `stop=["\n"]`), pensados para forzar salidas cortas y deterministas propias de un autocompletado.

## Capacidades

- Prediccion de texto inline (ghost text) en japones: genera la continuacion de la frase en curso para mostrarla como sugerencia aceptable con Tab.
- Salidas cortas y deterministas: el uso previsto limita la generacion a 24 tokens con parada en salto de linea.
- Inferencia en CPU: disenado para funcionar con `-ngl 0` y 4 hilos, sin necesidad de GPU.
- Despliegue via `llama.cpp` (`llama-server`) exponiendo el endpoint `/v1/completions` compatible con la API de OpenAI.
- Integracion especifica con el editor syki mediante su bloque de configuracion `autocomplete` (`baseUrl`, `delayMs`, `maxTokens`).
- No se declaran capacidades de razonamiento multi-paso, tool calling, function calling, vision, audio ni agentes.
- Multilingue: solo japones; no se declara soporte de otros idiomas.
- No se declara modo thinking ni capacidades de codigo o matematicas.

## Casos de uso

- Autocompletado en el editor syki: el caso de uso principal y practicamente unico previsto. El modelo se conecta al endpoint local `/v1/completions` de `llama-server` y devuelve continuaciones de hasta 24 tokens con parada en salto de linea, que el editor muestra como ghost text.
- Escritura de notas y borradores en japones offline: al ejecutarse en CPU con unos 300 MB de RAM, permite predecir frases en portatiles sin GPU y sin enviar el contenido a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Entornos air-gapped o con datos sensibles: al ser un fichero GGUF local de 178 MB, se puede desplegar en maquinas aisladas donde no se permite el uso de APIs en la nube.
- Prototipado de interfaces de escritura predictiva: sirve como referencia para medir latencia y tasa de parada natural en un pipeline de autocompletado antes de invertir en modelos mayores.
- Integracion en herramientas de edicion propias: cualquier editor que consuma la API de completions de OpenAI puede apuntar a este endpoint local, siempre que la interfaz sea en japones.
- Evaluacion de tecnicas de compresion: util como caso de estudio de poda de capas, recorte de vocabulario, destilacion y cuantizacion imatrix aplicadas a un modelo de 0,5B con objetivos de latencia estrictos.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 500 prompts en japones, ejecutados con `llama.cpp b12818` en CPU de 4 hilos (`-ngl 0 -t 4 -c 2048`, `temperature=0.0`, `repeat_penalty=1.0`, `max_tokens=24`, `stop=["\n"]`):

| Metrica | Resultado |
|---|---|
| Tasa limpia (clean rate) | 486/500 (97,2 %) |
| Tasa de parada natural | 495/500 (99,0 %) |
| Salidas vacias | 0,6 % |
| Bucles | 0,4 % |
| Artefactos / texto corrupto | 0,0 % |
| Latencia P50 | 85 ms |
| Latencia media | 111 ms |
| Latencia P90 | 216 ms |
| Arranque en frio | ~470 ms |
| Memoria en CPU | ~300 MB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible, lo cual es coherente con el proposito acotado del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 MB en modo CPU (`-ngl 0`); en GPU, el fichero de 178 MB cabe holgadamente en cualquier GPU con al menos 1-2 GB de VRAM libre, aunque no se publican cifras exactas de consumo en GPU.
- GPU recomendadas: el autor documenta soporte Vulkan y CUDA con `-ngl 99`, sin especificar modelos concretos. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobradamente suficiente por tamano.
- CPU: caso principal. Con 4 hilos se obtiene P50 de 85 ms y unos 300 MB de RAM, por lo que cabe en portatiles de 8 GB de RAM.
- Opciones de despliegue: `llama.cpp` (`llama-server`) segun la documentacion del autor. No se mencionan vLLM, TGI, Ollama ni otros runners, aunque al ser GGUF estandar podrian ser tecnicamente compatibles sin garantia del autor.
- Latencia y throughput: P50 85 ms, media 111 ms, P90 216 ms en CPU de 4 hilos; arranque en frio ~470 ms. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| syki-ghost (v3.1) | 416,85 M (base); podado a 16 capas | 2048 | ja | MIT | GGUF (IQ3_XXS) | Autocompletado inline en japones, CPU-first |
| sbintuitions/sarashina2.2-0.5b (base) | ~0,5 B | no disponible en la informacion | ja | MIT | safetensors | Modelo generalista japones de 0,5B |
| Modelos de autocompletado tipo FIM de 0,5-1B (p. ej. variantes Qwen/StarCoder) | 0,5-1 B | variable | multilingue | variable | GGUF / safetensors | Autocompletado de codigo o texto, no especifico de japones |

La comparacion directa con alternativas de autocompletado en japones no esta disponible en la informacion proporcionada. Frente a su modelo base, syki-ghost sacrifica cobertura generalista a cambio de latencia muy baja y tamano reducido; frente a modelos de autocompletado de codigo, el dominio es distinto (texto natural en japones, no codigo).

## Limitaciones y advertencias

- Modelo altamente especializado: no es adecuado para generacion de texto general, razonamiento, codigo, matematicas ni tareas conversacionales.
- Solo japones: no se declara ni garantiza funcionamiento en castellano ni en otros idiomas.
- Dependencia del ecosistema syki: el autor lo presenta como modelo exclusivo para ese editor; su uso fuera de el requiere integrar manualmente el endpoint de completions.
- Contexto limitado a 2048 tokens y salidas de 24 tokens: no esta pensado para contextos largos.
- Riesgo de alucinacion y de continuaciones incoherentes: aunque el autor reporta 0,4 % de bucles y 0 % de artefactos en su test de 500 prompts, se trata de una evaluacion propia, acotada y no replicada de forma independiente.
- Sin datos de sesgos: no se publica ninguna evaluacion de sesgos, toxicidad ni calidad en dominios sensibles.
- Un unico fichero y una unica cuantizacion (IQ3_XXS): no hay alternativas de precision ni pesos en safetensors en el repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Licencia MIT permite uso comercial, pero la atribucion a SB Intuitions y al autor original debe mantenerse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youyouyouyou/syki-ghost
- Descarga directa del GGUF: https://huggingface.co/youyouyouyou/syki-ghost/resolve/main/syki-ghost-v3.1.gguf
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-0.5b
- Repositorio del editor syki: https://github.com/youshinh/syki
