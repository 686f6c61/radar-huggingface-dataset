# zerodigest/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-YMQ-GGUF

## Resumen

El modelo `Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-YMQ-GGUF` es una cuantizacion GGUF del modelo `Qwen3.8-27B-Cold-Fusion-GAIN-V1.1` creado por DavidAU, un fine-tune de la familia Qwen 3.8 con 27 000 millones de parametros. El modelo base aplica la metodologia de entrenamiento COLD FUSION, que combina la tecnica GAIN (ajuste dinamico por muestra) con la infraestructura de Unsloth, logrando reducir los tokens de razonamiento entre un 50 % y un 90 % respecto al modelo Qwen 3.8 estandar, manteniendo cerca del 99 % del rendimiento en precision completa (BF16) incluso tras cuantizaciones a 8 bits y 4 bits.

Esta version concreta, publicada por el usuario `zerodigest`, es el resultado de un proceso de cuantizacion avanzado denominado YMQ-Compiler v2.0, que aplica una distribucion mixta de bits por capa inspirada en la filosofia de Intel AutoRound. En lugar de usar una profundidad de bits uniforme en todo el modelo, el compilador analiza la importancia de cada tensor en espacio logaritmico y asigna precisiones mas altas a las capas criticas (atencion, rutas de estado, cabeceras de clasificacion) y mas bajas a las capas de almacenamiento de datos. Esto produce varios presets optimizados para distintos presupuestos de VRAM, con el objetivo de ejecutar el modelo en GPUs de consumo de 12 GB a 16 GB sin sacrificar demasiada calidad.

El modelo es relevante porque ofrece una alternativa eficiente para ejecutar un LLM de 27B con razonamiento rapido y bajo uso de memoria, ideal para entornos de desarrollo local, agentes de codigo (como RooCode o Aider) y aplicaciones de generacion de texto con contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Transformer + Mamba (State Space Model) |
| Parametros totales | 27 320 697 814 (~27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ4_XS, IQ3_XS, Q5_K, Q2_K, IQ3_XXS, IQ4_NL (segun preset) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B-Cold-Fusion-GAIN-V1.1` es un fine-tune de Qwen 3.8 con 27 B de parametros, desarrollado por DavidAU. Su arquitectura combina bloques Transformer con capas de atencion multi-cabeza (MHA) y bloques Mamba de espacio de estado (SSM), lo que le permite gestionar contextos largos de forma eficiente. El entrenamiento emplea la tecnica COLD FUSION, que integra el metodo GAIN (ajuste dinamico de tokens de razonamiento por muestra) con el framework de entrenamiento de Unsloth. Este enfoque reduce significativamente la cantidad de tokens de razonamiento generados en las respuestas, lo que acelera la inferencia y reduce costes, manteniendo un rendimiento comparable al modelo original.

La cuantizacion YMQ-Compiler v2.0 aplica una estrategia de precision mixta basada en el analisis de la importancia de cada capa. El proceso incluye cinco etapas: deteccion de brechas de varianza en espacio logaritmico para asignar bits de forma adaptativa, proteccion de las capas de entrada con una rampa de cuantizacion progresiva (IQ4_NL → IQ4_XS → IQ3_XXS), aislamiento de las rutas de atencion y Mamba para evitar ruido, blindaje asimetrico del vocabulario para evitar errores de formato y un pre-tokenizado para soportar la decodificacion especulativa de multiples tokens (MTP). El modelo cuantizado mantiene la compatibilidad con motores de especulacion MTP nativos.

## Capacidades

- Generacion de texto y conversacion con razonamiento interno reducido en tokens (gracias al entrenamiento COLD FUSION).
- Razonamiento logico y matematico basado en las capacidades del modelo Qwen 3.8 de 27 B.
- Generacion de codigo y soporte de herramientas de desarrollo como RooCode y Aider, segun la descripcion del autor de la cuantizacion.
- Soporte nativo para decodificacion especulativa de multiples tokens (MTP) gracias a la configuracion de cuantizacion.
- Capacidades multilingues no confirmadas explicitamente en la informacion disponible; se recomienda verificar con el modelo base.
- No se mencionan capacidades de vision o audio; el modelo es puramente de texto.

## Casos de uso

- Asistente de codigo local: el preset XS-Pro (10,6 GB) permite ejecutar el modelo en GPUs con 12 GB de VRAM, ideal para autocompletar y refactorizar codigo en editores como VS Code o Neovim con herramientas como Continue o Aider, sin necesidad de conexion a la nube.
- Desarrollo de agentes con contexto largo: el preset M (~14 GB) ofrece una ventana de contexto amplia (aunque el valor exacto no se especifica) y proteccion de las capas de atencion, lo que lo hace adecuado para agentes que gestionan repositorios grandes o conversaciones multi-turno con historial extenso.
- Inferencia especulativa en produccion: al soportar MTP, el modelo puede acelerar la generacion de texto en servidores de inferencia como llama.cpp, reduciendo la latencia percibida en aplicaciones de chat o generacion de documentos.
- Educacion y prototipado: permite a investigadores y estudiantes experimentar con un LLM de 27 B en hardware de consumo, sin incurrir en costes de GPU en la nube.
- Generacion de documentacion tecnica: su capacidad de razonamiento y codigo permite crear documentacion de APIs, comentarios de codigo o resumenes de repositorios con una calidad aceptable.
- Automatizacion de tareas de programacion: con tool calling (si el modelo base lo soporta, no confirmado), puede integrarse en pipelines de CI/CD para generar pruebas, corregir errores o sugerir mejoras de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo base (Qwen3.8-27B-Cold-Fusion-GAIN-V1.1) en la informacion proporcionada. La unica metrica disponible es la perplexity (PPL) en el corpus WikiText-2, medida por el creador de la cuantizacion con `llama-perplexity` sobre una ventana de contexto de 4096 tokens:

| Preset | Tamano de archivo | Perplexity (menor es mejor) |
|---|---|---|
| XS-Pro | ~10,6 GB | No indicado |
| S-Pro | ~12,5 GB | 6,5087 |
| M (recomendado) | ~14,0 GB | 6,3663 |

Estos valores son internos de la cuantizacion y no permiten comparar con otros modelos directamente. No se dispone de datos sobre exactitud en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Preset XS-Pro (~10,6 GB): requiere al menos 12 GB de VRAM para inferencia completa en memoria (deja ~1,6 GB de margen para contexto). Compatible con GPUs como RTX 3060 12 GB, RTX 4070 Ti 12 GB o RTX 3090.
- Preset S-Pro (~12,5 GB): pensado para GPUs con 16 GB de VRAM, como RTX 4080, RTX 4090 o A4000 de 16 GB.
- Preset M (~14,0 GB): requiere 16 GB o mas de VRAM para contextos largos; recomendado para GPUs de gama alta como RTX 4090, A5000 o A6000.
- En todos los casos se recomienda usar motores de inferencia compatibles con GGUF: `llama.cpp`, `Ollama`, `LM Studio` o `KoboldCpp`.
- Para decodificacion especulativa MTP, se requiere un motor que soporte el protocolo (por ejemplo, llama.cpp con opciones de especulacion).
- No se han publicado mediciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de la misma categoria. La cuantizacion YMQ se basa en un modelo Qwen 3.8 de 27 B, que es una variante reciente de la serie Qwen. Sin informacion adicional sobre el rendimiento en benchmarks estandarizados, no se puede establecer una comparativa fiable con modelos como Llama 3.1 27B o Mistral Large 27B. Se recomienda consultar los benchmarks del modelo base (no disponibles) para evaluar su posicionamiento.

## Limitaciones y advertencias

- La informacion sobre la longitud de contexto no se especifica en la model card; se recomienda verificar el limite real antes de usarlo en produccion para evitar truncamientos inesperados.
- El modelo base ha sido entrenado con una reduccion de tokens de razonamiento, lo que puede afectar a tareas que requieren un razonamiento explicito y extenso; en escenarios complejos, la calidad puede ser inferior a la de modelos con razonamiento completo.
- El proceso de cuantizacion YMQ es una tecnica propietaria del autor; no hay evidencia publica independiente de que la distribucion mixta de bits supere a cuantizaciones estandar como Q4_K_M o Q5_K_M, mas alla de las mediciones de perplexity internas.
- La cuantizacion a 2 bits (Q2_K) en capas auxiliares puede introducir ruido en la generacion de texto, especialmente en tareas de alta precision como matematicas o logica formal.
- El modelo no ha sido evaluado en idiomas distintos del ingles (no se indican idiomas soportados). Puede presentar sesgos o degradacion de rendimiento en castellano u otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero la atribucion y las condiciones de redistribucion deben respetarse. El modelo base tambien es Apache-2.0.
- No se han publicado evaluaciones de sesgos, toxicidad o alucinaciones. Como LLM, existe riesgo de generar contenido falso o dañino.

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/zerodigest/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-YMQ-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Cuantizacion GGUF del modelo base (NM-DAU-NEO-MAX-MTP): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Articulo sobre Cold Fusion: https://hackernoon.com/qwen38-27b-cold-fusion-cuts-thinking-tokens-without-sacrificing-performance
