# tacos4me/DeepSeek-V4.1-Flash-Prune-2xRTX6K

## Resumen

Este repositorio no es un checkpoint nuevo, sino una receta de despliegue y una colección de parches para ejecutar el modelo DeepSeek-V4.1-Flash (552.000 millones de parámetros, arquitectura MoE) sobre dos GPU de estación de trabajo. El autor, tacos4me, parte del checkpoint oficial de DeepSeek e implementa dos vías: streaming de expertos desde NVMe (bit-exacta pero limitada a 8-9 tok/s) y poda de expertos guiada por frecuencia de routing, que reduce la selección de 384 a 224 expertos enrutados por capa y permite mantener todo el modelo residente en VRAM. Los expertos conservados se ejecutan en la precisión FP4 nativa del checkpoint, sin cuantización por debajo de 4 bits.

El problema que resuelve es de capacidad: el backbone más los 384 expertos por capa ocupan aproximadamente 135 GB por rango, mientras que dos RTX PRO 6000 de 96 GB ofrecen 95,6 GB útiles por tarjeta. La poda, junto con siete optimizaciones de kernel y planificación para SM120, lleva el decode de 11,8 ms a 6,8 ms por paso y de 82 a 141 tok/s en un único stream (288 tok/s con tres streams concurrentes). El contexto declarado es de 1 millón de tokens, con recuperación tipo needle-in-haystack verificada a 548K.

Es relevante ahora porque documenta, con mediciones A/B/A en la misma máquina, cuánto cuesta realmente podar un MoE de gran tamaño: el autor advierte explícitamente de que el conjunto de expertos conservados no es definitivo y de que el rendimiento en química está muy por debajo del de física.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), con expertos enrutados y componentes Engram gestionados en host |
| Parametros totales | 552 000 millones (modelo base DeepSeek-V4.1-Flash) |
| Parametros activos | no disponible |
| Longitud de contexto | 1 048 576 tokens (1M); needle-in-haystack verificado a 548K; recall correcto a 196K y 430K |
| Tipos de cuantizacion | FP4 nativa del checkpoint para los expertos conservados; rutas FP8 GEMV para LM head y lineales. Sin cuantizacion sub-4-bit |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio aporta keep sets, parches y configuracion de lanzamiento; los pesos se obtienen del checkpoint oficial) |
| Expertos enrutados por capa | 384 en el checkpoint completo; 224 en la configuracion podada desplegada |
| Motor de inferencia | SGLang, rama dsv4.1 mas 20 commits locales, tensor parallel 2 (TP2) |
| Hardware de referencia | 2 x RTX PRO 6000 Blackwell (SM120, 96 GB, PCIe 5.0 x16, sin NVLink) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero ni de un fine-tune con datos propios: el repositorio parte del checkpoint deepseek-ai/DeepSeek-V4.1-Flash y aplica una poda estructurada de expertos. La selección de los 224 expertos que se conservan por capa se realiza por frecuencia de routing sobre un corpus ponderado por dominio. El autor indica que este conjunto es un trabajo en curso y que es "mediblemente incorrecto" para química: la cobertura de routing en química está 10 puntos por debajo de la de física. Ya existe un conjunto reequilibrado que eleva la puntuación de química del 45% al 87%, pero no se ha publicado a la espera de una pasada de validación limpia.

Las optimizaciones de rendimiento son siete cambios independientes sobre el árbol de SGLang, cada uno evaluado con A/B/A (baseline, cambio, baseline) para acotar la varianza entre arranques, estimada en un 10%. Destacan: fusión del lanzamiento del paso de decode (-28,5% en un stream, +22% a tres streams), que eliminó 2 ms por paso de Python en host durante el pre-gather de Engram (una sincronización device-to-host de los row ids más unas 850 µs de orquestación); agrupación del GEMV FP8 de `wo_a`, que antes se ejecutaba como 40 llamadas cuBLAS en bf16 por paso debido a un desajuste entre las escalas de bloque 32×32 del checkpoint y el requisito 128×128 de la ruta fusionada; tablas Engram ancladas en RAM de host con el gather dentro del grafo CUDA; indexador de contexto largo con top-k por clúster habilitado en SM120 y puntuación densa con KV-split; fusión de la cadena de slots post-top-k en un único kernel Triton (de 18 lanzamientos a 1 por capa de indexador); LM head en FP8 sobre el GEMV de streaming; y lanzamiento dependiente programático en todo el grafo. Todas las banderas están desactivadas por defecto, de modo que el árbol parcheado sin flags se comporta como la rama estándar.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del checkpoint base DeepSeek-V4.1-Flash.
- Razonamiento matemático verificado por el autor: GSM8K-100 sin modo thinking con 99-100%, y GSM8K-20 con thinking en 19/20.
- Recuperación en contexto largo: needle recall correcto a 196K y 430K tokens, con verificación declarada a 548K sobre una ventana de 1M.
- Inferencia multi-stream: 3 streams concurrentes con 288 tok/s agregados.
- Razonamiento científico limitado: GPQA Diamond 67,7% con el conjunto de expertos antiguo; química 45% frente a física 94%.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales o de audio: no disponibles.
- Modo speculative decoding: mencionado como variante disponible en la documentación de `serve/README.md`, sin cifras de rendimiento aportadas.
- Idiomas: únicamente inglés declarado en los metadatos del repositorio.

## Casos de uso

- Análisis de documentación extensa y corpus técnicos: la ventana de 1M tokens y el recall verificado a 548K permiten ingestas de manuales, expedientes o repositorios documentales completos sin fragmentación, con prefill de ~9.800 tok/s (un prompt de 910K tokens en 93 s).
- Despliegue self-hosted en estación de trabajo: equipos que no pueden enviar datos a una API externa pueden ejecutar el modelo íntegramente en VRAM sobre dos RTX PRO 6000, con los pesos residentes en GPU y sin acceso a disco durante el decode.
- Servicio interno para grupos pequeños: con 288 tok/s a tres streams concurrentes, cubre el uso interactivo de unos pocos usuarios simultáneos sin colas perceptibles.
- Investigación en inferencia sobre SM120: el repositorio es una referencia reproducible de kernels CUDA, fusión de lanzamientos y planificación dependiente específica para Blackwell, con 20 commits locales sobre SGLang.
- Estudio de poda de expertos en MoE: sirve como caso medido del compromiso entre reducción de huella de memoria y degradación de calidad por dominio, con A/B/A documentado y un conjunto de referencia sin podar.
- Experimentación con cuantización FP4 y FP8: la configuración mantiene la precisión FP4 del checkpoint en los expertos y usa rutas FP8 GEMV en LM head y lineales, lo que permite comparar calidad frente a alternativas sub-4-bit.
- Verificación aritmética y tutoring de matemáticas: con GSM8K-100 en 99-100% sin thinking, es adecuado para tareas de comprobación de cálculos paso a paso.
- Escenarios fuera de alcance: cualquier carga con componente químico debe evitarse hasta que se publique el conjunto de expertos reequilibrado, dado el 45% actual en GPQA Chemistry.

## Benchmarks y rendimiento

Datos aportados por el autor. Las cifras de calidad corresponden al conjunto de expertos antiguo y el propio autor espera que mejoren con el conjunto reequilibrado.

| Metrica | Resultado |
|---|---|
| GSM8K-100 (sin thinking) | 99-100% |
| GSM8K-20 (con thinking) | 19/20 |
| GPQA Diamond | 67,7% |
| GPQA Chemistry | 45% |
| GPQA Physics | 94% |
| GPQA Chemistry (conjunto reequilibrado, no publicado) | 87% |
| Needle-in-haystack | Correcto a 196K, 430K y verificado a 548K |
| Decode, 1 stream | 141 tok/s |
| Decode, 3 streams | 288 tok/s |
| Decode con streaming desde NVMe (sin podar) | 8-9 tok/s |
| Prefill | ~9.800 tok/s; prompt de 910K tokens en 93 s |
| Paso de decode | 11,8 ms -> 6,8 ms |
| Mejora acumulada en 1 stream | 82 -> 141 tok/s (+72%) |
| Mejora acumulada en 3 streams | 187 -> 288 tok/s (+54%) |

Desglose de las optimizaciones (ganancia declarada, un stream / tres streams): fusión del lanzamiento del decode +28,5% / +22%; GEMV FP8 agrupado de `wo_a` +4,8% / +2,8%; tablas Engram ancladas en RAM de host +4,1% / +2,0%; indexador de contexto largo +1,9% corto y +4,3% a 256K; fusión de la cadena post-top-k +1,6% / +2,3%; LM head FP8 +1,7% / +1,0%; lanzamiento dependiente en todo el grafo +1,1% / +0,4%.

No se aportan cifras comparativas contra modelos de terceros (MMLU, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM: la configuración completa sin podar requiere ~135 GB por rango, inasumible en dos tarjetas de 96 GB (95,6 GB útiles cada una). La configuración podada con 224 de 384 expertos por capa y FP4 nativa cabe íntegramente en GPU sobre 192 GB agregados, con MEMFRAC 0.975.
- GPU: 2 x RTX PRO 6000 Blackwell (SM120, 96 GB, PCIe 5.0 x16). No se ha validado sobre otras arquitecturas; varios parches están condicionados a SM120 (top-k por clúster, lanzamiento dependiente).
- Interconexión: PCIe 5.0 x16 sin NVLink, con tensor parallel 2.
- RAM de host: ~190 GB libres si se usa la ruta de tablas Engram ancladas.
- GPU de consumo: no cabe. El modelo no es ejecutable en una RTX 4090 (24 GB) ni en tarjetas de 48 GB en esta configuración.
- Almacenamiento: la ruta alternativa de streaming de expertos desde NVMe funciona y es bit-exacta, pero queda limitada por ancho de banda a 8-9 tok/s; sirve como implementación de referencia y control sin podar.
- Opciones de despliegue: SGLang en la rama dsv4.1 con los parches aplicados mediante `git am`, con o sin las variables de entorno de optimización; se mencionan definiciones de carriles para llama-swap y una variante con speculative decoding en `serve/README.md`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Parámetros de servicio relevantes: CHUNK 4096, CGBS 3, MAXREQ 3, CTX 1048576, MAXTOT 1.100.000.
- Latencia y throughput: 6,8 ms por paso de decode; 141 tok/s en un stream; 288 tok/s a tres streams; prefill ~9.800 tok/s.

## Comparativa con modelos similares

La información disponible solo permite comparar frente a las variantes derivadas del mismo checkpoint.

| Configuracion | Expertos por capa | Precision | Huella | Decode (1 stream) | Calidad | Licencia |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash completo (oficial) | 384 | FP4 del checkpoint | ~135 GB por rango; no cabe en 2 x 96 GB | no disponible | Cifras publicadas por DeepSeek; el autor no reclama paridad | no disponible en esta ficha |
| Streaming desde NVMe, sin podar | 384 | FP4 del checkpoint | GPU residente parcial + NVMe | 8-9 tok/s | Bit-exacta, sirve de control | MIT (repositorio) |
| Esta receta, podada (desplegada) | 224 | FP4 nativa | 192 GB de VRAM agregada, totalmente residente | 141 tok/s | GSM8K 99-100%; GPQA Diamond 67,7%; química 45% | MIT (repositorio) |

No se dispone de datos de benchmarks ni de parámetros de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint nuevo: el repositorio aporta keep sets, parches y configuración de lanzamiento; los pesos deben descargarse del modelo base oficial.
- La poda no es sin pérdidas. Eliminar 160 de 384 expertos por capa degrada la precisión en algunos dominios, y el autor lo califica de deliberadamente poco halagador.
- Selección de expertos en curso: el conjunto publicado es, según el autor, mediblemente incorrecto para química, con cobertura de routing 10 puntos por debajo de física y GPQA Chemistry en 45% frente a 94% en física. Un conjunto reequilibrado eleva química al 87%, pero está construido y no publicado.
- Ninguna cifra de calidad de este repositorio debe compararse con los números publicados por DeepSeek; son mediciones sobre dos tarjetas de estación de trabajo.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas: solo inglés declarado en los metadatos.
- Las optimizaciones están condicionadas a hardware SM120 y a la rama dsv4.1 de SGLang; fuera de esa combinación no están validadas.
- Varianza entre arranques de aproximadamente el 10% en este stack, motivo por el que el autor solo acepta comparaciones A/B/A.
- Licencia MIT para el material del repositorio; el uso comercial del checkpoint base queda sujeto a la licencia de deepseek-ai/DeepSeek-V4.1-Flash, no especificada aquí.
- Los enlaces proporcionados por la búsqueda web no contienen información relevante sobre el modelo; corresponden a sitios de solitario y se descartan.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tacos4me/DeepSeek-V4.1-Flash-Prune-2xRTX6K
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Documentación de despliegue del autor: `serve/README.md` dentro del propio repositorio (definiciones de carriles de llama-swap, variante con speculative decoding y aritmética de memoria)
- SGLang (motor de inferencia referenciado): no se proporciona URL en la información disponible
- Paper, blog o demo adicionales: no disponibles
