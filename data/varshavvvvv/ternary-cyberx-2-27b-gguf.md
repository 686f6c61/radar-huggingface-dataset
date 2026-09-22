# varshavvvvv/Ternary-CyberX-2-27B-gguf

## Resumen

Bonsai 2 27B es un modelo de lenguaje de 27B de clase densa cuyos pesos se han convertido íntegramente a representación ternaria ({−1, 0, +1}) y se distribuyen en formato GGUF para llama.cpp. El repositorio analizado, `varshavvvvv/Ternary-CyberX-2-27B-gguf`, es una réplica publicada por un tercero del empaquetado ternario de Bonsai 2 27B, derivado a su vez del modelo base Qwen/Qwen3.8-27B, un transformer causal de atención híbrida (aproximadamente 75 % atención lineal y 25 % atención completa). La arquitectura no se modifica respecto al modelo base: lo que cambia es la representación numérica de los pesos.

La propuesta técnica es radical: en lugar de recurrir a cuantizaciones de 2 bits con "válvulas de escape" en alta precisión, todos los pesos lingüísticos (embeddings, proyecciones de atención, proyecciones MLP y LM head) se almacenan como ternarios con una escala FP16 compartida por grupo de 128 pesos, lo que da un coste real de 1,72 bits por peso. El resultado son ficheros de 5,95 GB (empaquetado PTQ1_0) o 7,21 GB (PQ2_0), frente a los ~54 GB de una build FP16 equivalente, una reducción ideal de aproximadamente 9,3x.

Su relevancia actual reside en que demuestra que el razonamiento de nivel 27B, incluyendo modo thinking, matemáticas, código y tool calling agéntico, sobrevive en el régimen sub-4-bit donde las representaciones convencionales se degradan. La model card reporta una retención del 98,2 % de la inteligencia FP16, con 84,78 de media en 14 benchmarks en modo thinking y unos 47 tok/s en un portátil con Apple M5 Max, lo que abre la inferencia de un 27B en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención híbrida (~75 % lineal / ~25 % completa), SwiGLU MLP, RoPE, RMSNorm (la del modelo base Qwen3.8-27B, sin cambios) |
| Parametros totales | 27,36B según la model card (24,35B de backbone lingüístico en 64 bloques + 2,54B de embedding/LM head + 0,46B de torre de visión en 27 bloques). El repo safetensors declara 26.895.998.464 parámetros (~26,9B) |
| Longitud de contexto | 262K tokens (heredada del modelo base) |
| Tipos de cuantizacion | Ternary g128 con escala FP16 por grupo de 128 pesos; empaquetados PTQ1_0 (1,75 bits/peso, 5,95 GB) y PQ2_0 (2,13 bits/peso, 7,21 GB); torre de visión opcional en Q8_0 mmproj (~0,63 GB) |
| Idiomas soportados | no disponible (los metadatos de HuggingFace no declaran idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF para llama.cpp; existe un compañero MLX de 2 bits (`prism-ml/Ternary-Bonsai-2-27B-mlx-2bit`) |
| Bits por peso (real) | 1,72 bits/peso, incluidos los tensores mantenidos por encima de la representación ternaria |
| Backends soportados | llama.cpp (CUDA, Metal, CPU) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B sin alterar su topología: un decoder causal de 64 bloques con atención híbrida en la que la mayor parte de las capas emplea atención lineal y solo una fracción minoritaria usa atención completa. Esa proporción (~75 % lineal / ~25 % completa) es precisamente lo que hace viable mantener una ventana de 262K tokens en un dispositivo de consumo, porque el coste de la atención deja de dominar el presupuesto de cómputo y memoria. El bloque MLP usa SwiGLU, y la normalización es RMSNorm con RoPE en las posiciones. Se añade una torre de visión de 27 bloques y 0,46B de parámetros, distribuida aparte como pack mmproj Q8_0 que solo se carga cuando hay entrada de imagen.

La innovación central no es arquitectónica sino de representación de pesos. Cada matriz se transforma en bloques mediante una rotación ortogonal de Hadamard (bloques de 1024 con signos ±1 fijos) antes de asignar los valores ternarios; la rotación se pliega dentro de los pesos almacenados, de modo que no consume bits ni tráfico de memoria adicional, y el runtime aplica la transformación equivalente sobre las activaciones. El fichero declara la rotación como metadato, así que un runtime o la aplica o rechaza cargar el modelo. Cada grupo de 128 pesos comparte un factor de escala FP16, y los pesos empaquetados se consumen directamente en los kernels, sin expandirse nunca de vuelta a FP16.

La model card no detalla el pipeline de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) ni el proceso exacto de cuantización post-entrenamiento más allá de la descripción del formato ternario y de la rotación Hadamard. El material de referencia menciona metodología y notas de medición en el whitepaper, pero esos detalles no están incluidos en la información proporcionada.

## Capacidades

- Generación de texto conversacional en modo base y en modo thinking, con retención explícita del comportamiento de razonamiento incluso por debajo de 4 bits.
- Razonamiento matemático: la model card reporta 96,57 en su evaluación de matemáticas, a medio punto de la precisión completa.
- Generación de código: 89,42, descrito como a la altura del baseline de precisión completa.
- Tool calling y comportamiento agéntico: 74,92 en la evaluación de tool calling agéntico reportada.
- Razonamiento multi-paso y cadenas de pensamiento: el modelo conserva el modo thinking del base, evaluado en 14 benchmarks de este tipo.
- Capacidad multimodal de entrada por imagen: la torre de visión se distribuye como pack mmproj Q8_0 separado y solo se carga cuando se necesita entrada visual.
- Contexto largo de hasta 262K tokens, práctico en dispositivo gracias al backbone de atención predominantemente lineal.
- Capacidades multilingües: no disponibles en la información proporcionada (los metadatos no declaran idiomas).
- Inferencia en CPU, CUDA y Metal a través de los kernels ternarios personalizados de llama.cpp.

## Casos de uso

- Razonamiento matemático asistido en local: con 96,57 en la evaluación de matemáticas reportada, el modelo permite resolver problemas de cálculo simbólico, verificación de derivaciones o generación de ejercicios resueltos en un portátil, sin enviar datos a un servicio externo.
- Asistencia de código en el IDE: al mantener 89,42 en código con solo 5,95 GB de pesos, se puede ejecutar como copiloto local que completa funciones, genera tests y explica código sin coste por token ni fuga de propiedad intelectual.
- Agentes con tool calling sobre documentos largos: los 262K tokens de contexto y el 74,92 en tool calling agéntico permiten construir agentes que leen contratos, informes o repositorios completos y encadenan llamadas a APIs de búsqueda, bases de datos o calculadoras.
- Atención al cliente multi-turno: la ventana de 262K tokens permite mantener el historial completo de una conversación prolongada más la base de conocimiento asociada, con el modelo corriendo en una única GPU de consumo o incluso en CPU.
- Análisis de documentos con imagen: cargando el pack mmproj Q8_0 (~0,63 GB), el modelo puede procesar capturas, diagramas o páginas escaneadas junto al texto, útil para extracción de datos de facturas o revisión de documentación técnica.
- Despliegue en el borde o en entornos air-gapped: con 5,95-7,21 GB de peso y soporte de CPU, cabe en dispositivos sin GPU dedicada y en instalaciones sin conexión, un requisito habitual en sanidad, defensa o industria.
- Investigación sobre cuantización extrema: el modelo sirve como referencia reproducible para estudiar cómo se degradan capacidades concretas (matemáticas, código, agentes) al bajar a 1,72 bits por peso, comparando PTQ1_0 frente a PQ2_0.
- Prototipado en Apple Silicon: existe un compañero MLX de 2 bits y forks de MLX y mlx-swift, lo que permite integrar el modelo en aplicaciones nativas de macOS e iOS.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. No se han publicado en la información disponible los nombres individuales de los 14 benchmarks de modo thinking ni resultados de MMLU, HumanEval o GSM8K desglosados.

| Metrica | Resultado reportado |
|---|---|
| Media en 14 benchmarks en modo thinking | 84,78 |
| Build convencional IQ2_XXS (referencia) | 72,59 |
| UD-Q4_K_XL (referencia, 3x el tamano) | dentro de 0,4 puntos de 84,78 |
| Matemáticas | 96,57 (a medio punto de precisión completa) |
| Código | 89,42 (a nivel del baseline) |
| Tool calling agéntico | 74,92 |
| Retención de inteligencia frente a FP16 | 98,2 % |
| Throughput en Apple M5 Max | ~47 tok/s |

## Requisitos de hardware

- Inferencia en PTQ1_0: 5,95 GB de pesos (1,75 bits/peso) más la caché KV, cuyo tamaño no se especifica en la información disponible.
- Inferencia en PQ2_0: 7,21 GB de pesos (2,13 bits/peso).
- Torre de visión opcional: ~0,63 GB adicionales en Q8_0, cargada solo para entrada de imagen.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 8-12 GB de VRAM puede alojar los pesos; una RTX 4090 (24 GB) deja margen amplio para contexto largo y lotes mayores.
- Funciona en CPU: los kernels ternarios de llama.cpp cubren el backend CPU, además de CUDA y Metal.
- Portátiles Apple Silicon: ~47 tok/s medidos en un Apple M5 Max con el backend Metal; existe compañero MLX de 2 bits con forks propios de MLX y mlx-swift para iOS/macOS.
- Despliegue: llama.cpp (fork de PrismML con los kernels ternarios, imprescindible para consumir los pesos empaquetados), servidores compatibles con endpoints de llama.cpp, y MLX en Apple Silicon. La model card no menciona soporte de vLLM, TGI ni Ollama oficiales, por lo que debe tratarse como no disponible.
- No se han publicado cifras de latencia ni de throughput para GPU dedicada en la información disponible.

## Comparativa con modelos similares

| Modelo | Representacion | Tamano desplegado | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai 2 27B ternario (PTQ1_0) | Ternaria g128, 1,72 bits/peso | 5,95 GB | 84,78 de media en 14 benchmarks thinking; 98,2 % de FP16 | Apache 2.0 | GGUF en HuggingFace; requiere fork de llama.cpp |
| Bonsai 2 27B ternario (PQ2_0) | Ternaria en slots de 2 bits, 2,13 bits/peso | 7,21 GB | Mismo modelo, empaquetado alternativo | Apache 2.0 | GGUF en HuggingFace |
| Build convencional IQ2_XXS del mismo base | Cuantizacion de 2 bits estandar | Más de 1,5x el tamano del ternario (la model card indica que el ternario ocupa menos de dos tercios de su huella) | 72,59 de media | Apache 2.0 | GGUF en HuggingFace |
| Build UD-Q4_K_XL del mismo base | Cuantizacion de ~4 bits | Aproximadamente 3x el tamano del ternario | Dentro de 0,4 puntos de 84,78 | Apache 2.0 | GGUF en HuggingFace |
| Qwen3.8-27B FP16 (modelo base) | FP16 | ~54 GB | Baseline de referencia (100 % de inteligencia) | Apache 2.0 | Pesos originales |

No se dispone de comparaciones con modelos de otros fabricantes de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio concreto (`varshavvvvv/Ternary-CyberX-2-27B-gguf`) está publicado por un tercero, no por Prism ML, y registra 0 descargas y 0 likes. La model card que contiene describe el modelo Bonsai 2 27B de Prism ML, por lo que la procedencia real de los ficheros de este repo no queda verificada en la información disponible.
- Existe una discrepancia numérica entre el recuento de parámetros del repo safetensors (26.895.998.464, ~26,9B) y el de la model card (27,36B en total). Conviene tratarla como una discrepancia sin resolver.
- No hay datos publicados sobre sesgos, composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO) en la información disponible, lo que impide evaluar riesgos de sesgo de forma fundamentada.
- Riesgo de alucinación inherente a cualquier modelo generativo: la cuantización ternaria agresiva puede degradar la calibración de la confianza, y la model card no reporta métricas específicas de fidelidad factual.
- Idiomas soportados no declarados en los metadatos; el rendimiento multilingüe real es desconocido.
- El contexto de 262K tokens es teórico en cuanto a ventana, pero no se especifica el consumo de memoria de la caché KV a esa longitud, que puede ser el factor limitante real en GPU de consumo.
- Requiere obligatoriamente un runtime que entienda el formato ternario y la rotación Hadamard declarada: llama.cpp estándar o vLLM/TGI/Ollama no podrán consumir estos ficheros sin los kernels del fork de PrismML, que rechazará el fichero si no aplica la transformación correspondiente.
- La licencia Apache 2.0 del modelo base y del empaquetado permite uso comercial, pero conviene verificar la cadena de licencias del repositorio de terceros antes de desplegarlo en producción.
- La model card está truncada en la sección de requisitos de memoria (tabla "Memory Requirement" incompleta), por lo que faltan datos de tamaño y reducción para algunos formatos.

## Enlaces

- Repositorio analizado: https://huggingface.co/varshavvvvv/Ternary-CyberX-2-27B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Compañero MLX de 2 bits: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels ternarios (CUDA + Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Sitio web de Prism ML: https://prismml.com
- Discord de la comunidad: https://discord.gg/prismml

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card del repositorio.
