# veri2-anon/sva-qlora-verified

## Resumen

sva-qlora-verified es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct, publicado por el autor anónimo veri2-anon. Su propósito es generar SystemVerilog Assertions (SVA) a partir de código RTL, una tarea de verificación formal de hardware que requiere tanto comprensión de diseño digital como capacidad de síntesis de propiedades temporales correctas. El adaptador se ha entrenado sobre el conjunto de pares formalmente verificados de la variante "Verified" del proyecto Veri2, lo que implica que los pares de entrenamiento han pasado comprobaciones formales.

El modelo es relevante en el nicho de la verificación asistida por IA: la generación automática de aserciones SVA es una de las aplicaciones de mayor valor en el flujo de diseño de chips, porque reduce el esfuerzo manual de verificación y puede aumentar la cobertura formal. Al ser un adaptador PEFT sobre un modelo de 7B, su huella de almacenamiento es de solo 0,6 GB, lo que facilita su distribución y despliegue sobre el modelo base ya conocido.

No se dispone de información sobre licencia, idiomas soportados, pipeline declarado ni resultados de benchmarks en la información proporcionada. La model card es mínima y remite a un repositorio anónimo para código, dataset y resultados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen2.5-Coder-7B-Instruct |
| Parámetros totales | no disponible (adaptador; el modelo base tiene 7B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no confirmada) |
| Tipos de cuantización | QLoRA (cuantización durante entrenamiento); cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema QLoRA: se congela el modelo base Qwen2.5-Coder-7B-Instruct (un transformer decoder de 7B parámetros) y se entrenan matrices de bajo rango sobre él, con el modelo base cuantizado durante el entrenamiento para reducir requisitos de memoria. El resultado es un conjunto de pesos LoRA en formato safetensors que debe cargarse junto con el modelo base mediante la librería PEFT.

El entrenamiento se realizó sobre los pares formalmente verificados de la variante "Verified" (Veri2) del proyecto, orientados a la generación de SystemVerilog Assertions a partir de RTL. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO ni hiperparámetros del adaptador (rango, alpha, dropout). Tampoco se documentan innovaciones técnicas adicionales más allá del uso de QLoRA y de la verificación formal de los pares de entrenamiento.

## Capacidades

- Generación de SystemVerilog Assertions (SVA) a partir de código RTL, su tarea principal y especializada.
- Razonamiento sobre diseño de hardware digital y propiedades temporales de verificación formal.
- Generación de código en el dominio de verificación de circuitos (SystemVerilog).
- Herencia de las capacidades generales del modelo base Qwen2.5-Coder-7B-Instruct (generación de texto y código, conversación instruct), aunque no se documenta el grado de preservación tras el ajuste.
- Soporte de tool calling / function calling: no disponible de forma específica para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma específica para el adaptador.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Generación automática de aserciones SVA en flujos de verificación de RTL: el adaptador recibe un módulo SystemVerilog y produce aserciones candidatas, reduciendo el trabajo manual del ingeniero de verificación y alimentando herramientas de model checking.
- Asistencia a ingenieros de verificación en entornos de edición: integrado como plugin o servicio que sugiere SVA mientras se escribe el testbench, aprovechando el ajuste específico al dominio.
- Aumento de cobertura formal en pipelines de CI de hardware: las aserciones generadas pueden incorporarse a suites de verificación formal y ejecutarse automáticamente en cada integración, detectando regresiones.
- Generación de propiedades para revisión humana: el modelo produce borradores de aserciones que un experto valida y refina, acelerando la escritura de especificaciones formales.
- Docencia y formación en verificación formal: permite a estudiantes comparar aserciones generadas por IA con las esperadas, sobre ejemplos de RTL reales.
- Investigación en generación de código específica de dominio: sirve como referencia reproducible (adaptador de 0,6 GB sobre un base público) para estudiar el ajuste fino QLoRA en tareas de EDA.
- Prototipado rápido de propiedades en exploración de diseño: durante las fases tempranas de un bloque RTL, generar aserciones preliminares para validar la intención del diseño antes de la verificación completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio anónimo https://anonymous.4open.science/r/veri2-CD05/ para consultar resultados, pero estos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- El adaptador ocupa 0,6 GB en disco; requiere cargar además el modelo base Qwen2.5-Coder-7B-Instruct (aproximadamente 14-15 GB en FP16, o menos con cuantización).
- VRAM estimada para inferencia: alrededor de 16 GB en FP16 para el modelo base más el adaptador; con cuantización de 8 bits, aproximadamente 8-9 GB; con 4 bits, aproximadamente 5-6 GB (estimaciones para el base, no confirmadas para este adaptador).
- GPU recomendadas: A100, H100 o L40S para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) suficiente para FP16; RTX 3090/4080 (16-24 GB) para FP16 o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización 4 bits, en GPUs de 8 GB como RTX 3070/4060.
- Opciones de despliegue: carga del adaptador con PEFT sobre transformers; fusión del adaptador en el modelo base para servir con vLLM o TGI; conversión a GGUF para llama.cpp u Ollama (no documentada por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sva-qlora-verified | adaptador sobre 7B | no disponible | SVA desde RTL | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | no disponible en esta ficha | Código general | no disponible en esta ficha | Hugging Face |
| Alternativas específicas de SVA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con otros adaptadores o modelos especializados en generación de SVA. La comparación con el modelo base es la referencia más directa: el adaptador añade especialización en SystemVerilog Assertions a costa de un posible estrechamiento de las capacidades generales, sin datos publicados que cuantifiquen la mejora.

## Limitaciones y advertencias

- La model card es mínima: no se documentan licencia, idiomas, pipeline ni hiperparámetros, lo que dificulta evaluar su idoneidad para uso comercial.
- Al ser un adaptador sobre Qwen2.5-Coder-7B-Instruct, hereda los sesgos y limitaciones del modelo base, no documentados aquí.
- Riesgo de alucinación en aserciones SVA: el modelo puede generar propiedades sintácticamente válidas pero semánticamente incorrectas respecto al RTL; toda aserción generada debe validarse formalmente antes de su uso.
- El ajuste sobre pares verificados no garantiza corrección en diseños fuera de la distribución del dataset de entrenamiento.
- Sin datos de benchmarks, no es posible cuantificar la mejora frente al modelo base ni frente a alternativas.
- Repositorio anónimo y sin descargas ni likes: no hay evidencia de uso comunitario ni mantenimiento.
- Restricciones de licencia para uso comercial: no disponibles; debe consultarse la licencia del modelo base y la del adaptador antes de producción.
- Limitaciones de contexto e idioma: no disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/veri2-anon/sva-qlora-verified
- Repositorio del proyecto (código, dataset y resultados): https://anonymous.4open.science/r/veri2-CD05/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
