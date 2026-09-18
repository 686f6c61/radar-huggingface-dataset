# TechnoBaptist/Ternary-Bonsai-2-27B-mlx-2bit

## Resumen

Ternary-Bonsai-2-27B-mlx-2bit es un modelo de lenguaje de 27.360 millones de parámetros cuyos pesos están almacenados en representación ternaria ({−1, 0, +1}) con escalas FP16 por grupo de 128 pesos. Deriva de Qwen3.8-27B, un transformer causal con atención híbrida y 262.000 tokens de contexto, y lo publica en HuggingFace el usuario TechnoBaptist como empaquetado MLX del Bonsai 2 27B desarrollado por Prism ML. El problema que resuelve es el de la inferencia de un modelo de clase 27B en hardware de consumo: el pack completo ocupa 8,60 GB en disco (7,67 GB de modelo de lenguaje más 0,92 GB de torre de visión) frente a los aproximadamente 54 GB de una build FP16, manteniendo según el autor el 98,2% de la inteligencia de la versión de precisión completa.

La relevancia del modelo está en el régimen de compresión: el autor afirma que conserva razonamiento, matemáticas, código y comportamiento agéntico por debajo de los 4 bits efectivos, donde las cuantizaciones convencionales de ese rango se degradan de forma acusada. El coste real del formato es de 1,72 bits por peso (2,25 tal y como lo empaqueta el contenedor de MLX), y para consumir los pesos empaquetados sin expandirlos a FP16 hacen falta kernels personalizados de atención híbrida ternaria en MLX y CUDA.

El modelo incluye la torre de visión oficial de Qwen3.8-27B sin cuantizar y se distribuye bajo licencia Apache 2.0, con un compañero en formato GGUF para llama.cpp. La ficha no publica lista de idiomas soportados ni resultados desglosados de los 14 benchmarks de modo pensamiento que menciona de forma agregada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención híbrida (~75% atención lineal / ~25% atención completa), MLP SwiGLU, RoPE, RMSNorm |
| Parametros totales | 27.360 millones (27,36B): 24,35B de columna vertebral de lenguaje en 64 bloques + 2,54B de embeddings y LM head + 0,46B de torre de visión en 27 bloques |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | Ternaria g128: pesos en {−1, 0, +1} con una escala FP16 compartida por grupo de 128 pesos; 1,72 bits/peso reales, 2,25 bits/peso tal y como los empaqueta MLX. Compañero GGUF en PTQ1_0 (5,95 GB) y PQ2_0 (7,21 GB) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors para MLX (contenedor MLX); existe un compañero GGUF para llama.cpp. La torre de visión va en FP16 sin cuantizar |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B sin modificaciones estructurales: atención híbrida con aproximadamente un 75% de capas de atención lineal y un 25% de atención completa, MLP con activación SwiGLU, codificación posicional RoPE y normalización RMSNorm. Esa proporción mayoritaria de atención lineal es lo que hace viable sostener una ventana de 262.000 tokens en dispositivo, ya que el coste de la atención completa solo se paga en una cuarta parte de las capas. El modelo consta de 64 bloques de columna vertebral, 24,35B de parámetros en dichos bloques, 2,54B en embeddings y cabeza de salida, y 0,46B adicionales en la torre de visión.

La innovación central no está en el entrenamiento sino en la representación de pesos. Cada matriz se transforma en bloques mediante una rotación de Hadamard ortogonal (bloque de 1024, con signos ±1 fijos) antes de asignar los valores ternarios; la rotación queda plegada en los pesos almacenados en disco, de modo que no consume bits ni ancho de banda adicional, y el runtime aplica la transformación correspondiente a las activaciones. El modelo declara la rotación como metadato, de forma que un runtime que no sepa aplicarla rechaza cargar el archivo. La cuantización ternaria cubre embeddings, proyecciones de atención, proyecciones del MLP y la LM head, sin tensores de alta precisión que actúen como vía de escape. El rendimiento declarado es de 84,78 de media en 14 benchmarks en modo pensamiento, con matemáticas en 96,57 (a medio punto de la precisión completa) y código en 89,42.

## Capacidades

- Generación de texto y conversación multi-turno con 262.000 tokens de contexto.
- Razonamiento en modo pensamiento (thinking mode), heredado del modelo base y preservado tras la cuantización según el autor.
- Matemáticas: 96,57 en el benchmark agregado reportado, a menos de medio punto de la precisión completa.
- Generación de código: 89,42, en línea con la baseline de precisión completa.
- Tool calling y comportamiento agéntico: 74,92 en la métrica de agentic tool calling reportada.
- Capacidades de visión: incluye la torre de visión oficial de Qwen3.8-27B (0,46B de parámetros, 27 bloques, FP16 sin cuantizar), empaquetada en el mismo pack.
- Ejecución en dispositivo y en el borde: kernels ternarios propios para Apple MLX (Python y Swift) y CUDA, que consumen los pesos empaquetados directamente sin expandirlos a FP16.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de razonamiento en portátil: el modelo cabe en 8,60 GB de disco y rinde a unos 47 tok/s en un Apple M5 Max, por lo que se puede ejecutar un modelo de clase 27B de forma local sin GPU de数据中心 y sin conexión a servicios externos.
- Análisis de documentos largos: los 262.000 tokens de contexto permiten ingerir informes completos, expedientes o bases de código extensas en una sola pasada, apoyándose en la atención mayoritariamente lineal para contener el coste de memoria.
- Agentes con tool calling sobre datos sensibles: el comportamiento agéntico reportado (74,92) permite construir flujos multi-paso que consulten APIs o bases de datos internas sin que los datos salgan del equipo.
- Asistencia a la programación en local: con 89,42 en la métrica de código, es utilizable para autocompletado, refactorización y generación de tests dentro de un IDE, integrándose en pipelines de CI/CD mediante los runtimes compatibles.
- Procesamiento de documentos con componente visual: al incluir la torre de visión, admite entradas de imagen junto a texto, lo que habilita transcripción de capturas, lectura de formularios escaneados o razonamiento sobre diagramas.
- Despliegue en el borde y dispositivos Apple: el fork de mlx-swift permite integrarlo en aplicaciones iOS y macOS nativas, útil para herramientas de campo sin conectividad.
- Evaluación e investigación en cuantización extrema: sirve como referencia reproducible para estudiar la degradación de capacidades por debajo de 4 bits frente a buildes IQ2_XXS o Q4_K_XL.
- Servicio local multiusuario en hardware de gama alta: mediante CUDA y el fork de llama.cpp se puede servir desde una única GPU profesional para un equipo pequeño, aunque el KV cache de 262K tokens es el principal consumidor de memoria en ese escenario.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La media agregada corresponde a 14 benchmarks en modo pensamiento; no se ofrece el desglose por prueba.

| Metrica | Ternary-Bonsai-2-27B | IQ2_XXS convencional | UD-Q4_K_XL | FP16 (modelo base) |
|---|---|---|---|---|
| Media en 14 benchmarks de pensamiento | 84,78 | 72,59 | 84,78 + ~0,4 puntos | 100% de referencia (98,2% retenido) |
| Matematicas | 96,57 | No disponible | No disponible | A menos de 0,5 puntos |
| Codigo | 89,42 | No disponible | No disponible | En línea con la baseline |
| Agentic tool calling | 74,92 | No disponible | No disponible | No disponible |
| Huella en disco | 8,60 GB | Inferior a 2/3 del tamaño de Bonsai (según el autor) | Aproximadamente 3x el tamaño de Bonsai | ~54 GB |

No se han publicado en la información disponible resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros) ni cifras de latencia más allá de los ~47 tok/s en Apple M5 Max.

## Requisitos de hardware

- Peso del modelo en disco: 8,60 GB en el pack MLX (7,67 GB de lenguaje + 0,92 GB de visión). La VRAM necesaria para inferencia parte de esa cifra más el KV cache y las activaciones; a 262K tokens de contexto el KV cache es el factor dominante y no se ha publicado su tamaño exacto.
- Alternativa GGUF: 5,95 GB con empaquetado PTQ1_0 y 7,21 GB con PQ2_0, para llama.cpp en CUDA, Metal o CPU.
- Cabe en GPU de consumo: sí, por tamaño de pesos. Una GPU con 12 GB o más debería alojar el modelo con contexto moderado; con 8 GB el margen es muy ajustado o insuficiente según la longitud de contexto.
- Apple Silicon: es la plataforma de referencia declarada, con MLX en Python y Swift (iOS y macOS). Se reportan ~47 tok/s en un Apple M5 Max.
- GPU profesionales: no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible; el soporte CUDA se canaliza a través de los forks de MLX y llama.cpp del autor.
- Opciones de despliegue: MLX (Python y Swift), CUDA mediante el fork de llama.cpp, llama.cpp con backend Metal y CPU, y el contenedor safetensors para MLX. No se mencionan vLLM, TGI ni Ollama en la documentación proporcionada.
- Latencia y throughput: ~47 tok/s en Apple M5 Max como único dato publicado. No hay cifras para CUDA, CPU ni para distintas longitudes de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Huella en disco | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B (este pack) | 27,36B | 262K | 1,72 reales / 2,25 en MLX | 8,60 GB (MLX) | 84,78 de media en 14 benchmarks | Apache 2.0 |
| IQ2_XXS convencional sobre el mismo base | 27B | No disponible | ~2 bits | Menos de 2/3 del tamaño de Bonsai según el autor | 72,59 de media | Depende de la build |
| UD-Q4_K_XL | 27B | No disponible | ~4 bits | Aproximadamente 3x el de Bonsai | ~0,4 puntos por encima de Bonsai | Depende de la build |
| Qwen3.8-27B (modelo base en FP16) | 27B | 262K | 16 | ~54 GB | Referencia de precisión completa | Apache 2.0 |
| Ternary-Bonsai-2-27B-gguf | 27,36B | 262K | Ternaria (PTQ1_0 / PQ2_0) | 5,95 GB / 7,21 GB | Mismo modelo, otro empaquetado | Apache 2.0 |

Los tres primeros comparadores son buildes de cuantización del mismo modelo base citados por el autor, no modelos distintos; la comparación relevante es la de formato. No se dispone de datos para comparar con alternativas de otros fabricantes en el mismo rango de tamaño.

## Limitaciones y advertencias

- La model card no publica sesgos conocidos, composición del dataset de entrenamiento ni detalles del proceso de ajuste; el modelo base es Qwen3.8-27B, del que hereda sus sesgos sin que esta ficha los documente.
- Riesgo de alucinación: no cuantificado en la información disponible. La cuantización agresiva puede aumentar la tasa de error en dominios poco representados aunque las métricas agregadas apenas caigan.
- La ventana de 262.000 tokens es nominal; no se documenta el rendimiento real (ni la degradación) en el extremo de esa ventana tras la cuantización.
- El KV cache para contextos muy largos puede superar con creces el tamaño de los pesos y no cabe en GPU de consumo en configuraciones extremas.
- Compatibilidad de runtime restringida: los pesos están en base rotada por Hadamard y requieren kernels específicos. Un runtime sin soporte para la rotación rechazará el archivo; no es un safetensors estándar que se pueda cargar con transformers sin más.
- No hay integración documentada con ecosistemas habituales de servicio (vLLM, TGI, Ollama); el despliegue depende de los forks mantenidos por el autor, lo que añade riesgo de mantenimiento en producción.
- Las cifras de rendimiento provienen del fabricante (Prism ML) y no de una evaluación independiente; conviene reproducirlas antes de decisiones de producción.
- Licencia Apache 2.0, permisiva para uso comercial, pero se debe verificar la licencia del modelo base y de los datos subyacentes antes de redistribuir derivados.
- El repositorio de HuggingFace registra 0 descargas y 0 me gusta en el momento de la consulta, y fue creado y actualizado en la misma fecha (2026-09-17): no hay historial de uso ni validación comunitaria de este empaquetado concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Compañero GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de MLX con kernels ternarios (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Fork de llama.cpp para CUDA: https://github.com/PrismML-Eng/llama.cpp
- Web de Prism ML: https://prismml.com
- Discord de la comunidad: https://discord.gg/prismml

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
