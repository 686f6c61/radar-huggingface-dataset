# steampunque/Qwen3-Coder-Next-MP-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de precisión mixta por capas del modelo Qwen3-Coder-Next, desarrollado por Qwen. El modelo original es un MoE (Mixture of Experts) de aproximadamente 80 mil millones de parámetros totales, con solo 3 mil millones de parámetros activos por token, optimizado para tareas de codificación y razonamiento agéntico. La cuantización, denominada Q4_E_H, ha sido creada por el usuario steampunque y aplica distintos niveles de cuantización por capa (Q5_K, Q4_K, Q6_K, etc.) para equilibrar el tamaño del archivo y la calidad del modelo, logrando un peso final de 48,6 GB.

La relevancia de esta ficha radica en que permite ejecutar un modelo de codificación de alto rendimiento en hardware de consumo: se requiere 48 GB de RAM y una GPU con al menos 8 GB de VRAM, descargando los tensores de los expertos a la CPU. El modelo base soporta una ventana de contexto de 256K tokens, lo que lo hace adecuado para tareas de razonamiento de largo alcance y uso complejo de herramientas. La cuantización ha sido optimizada para mantener una tasa de éxito del 100% en un conjunto reducido de prompts de generación de código, aunque el autor advierte que el modelo es sensible a la degradación por cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención recurrente |
| Parametros totales | 79.674.391.296 (aprox. 80B) |
| Parametros activos | 3B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Q4_E_H (híbrida por capas: Q5_K, Q4_K, Q6_K, etc.) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-Next es un transformer MoE con un esquema de atención recurrente, lo que impide el uso de decodificación especulativa estándar. La cuantización Q4_E_H no modifica la arquitectura, sino que asigna diferentes niveles de precisión a cada capa: las capas profundas usan menos bits (Q4_K) y las capas "cortex" (más cercanas a la salida) usan más bits (Q5_K, Q6_K), con el objetivo de minimizar la pérdida de rendimiento en las capas críticas. El tensor de embeddings y el de salida se cuantizan a Q6_K. Según el autor, esta configuración produce una perplejidad (PPL) de 7,7 frente a 7,6 de la cuantización estándar Q4_K_M, con un tamaño similar (48,6 GB frente a 48,5 GB). No se dispone de información sobre el entrenamiento original del modelo base, como el número de tokens o la composición del dataset.

## Capacidades

- Generación de código y asistencia en programación, optimizado para respuestas rápidas sin modo razonamiento explícito.
- Razonamiento de largo horizonte, adecuado para tareas que requieren múltiples pasos y planificación.
- Uso de herramientas (tool calling) y capacidades agénticas, según la documentación de Unsloth.
- Soporte de contexto largo de hasta 256K tokens, verificado con pruebas de "needle in a haystack".
- Ejecución eficiente en hardware de consumo mediante descarga de expertos a CPU, permitiendo contextos muy amplios incluso con poca VRAM.
- No soporta decodificación especulativa debido a la atención recurrente, aunque versiones recientes de llama.cpp podrían permitirla con rollback (no probado).

## Casos de uso

- Asistente de codificación en IDE: el modelo puede integrarse en editores como VS Code para autocompletar funciones, generar tests y refactorizar código, aprovechando su contexto de 256K para mantener el historial completo del proyecto.
- Agentes autónomos de codificación: gracias a su capacidad de tool calling y razonamiento de largo horizonte, puede ejecutar tareas como "arreglar este bug" encadenando llamadas a herramientas (git, compiladores, etc.) sin intervención humana.
- Generación de código en pipelines CI/CD: puede usarse para generar automáticamente código de prueba o documentación a partir de cambios en el repositorio, con la ventaja de ejecutarse localmente sin enviar datos a la nube.
- Prototipado rápido: desarrolladores con hardware modesto pueden generar esqueletos de aplicaciones o scripts de automatización sin depender de APIs externas.
- Análisis de código legacy: su ventana de contexto larga permite procesar archivos completos o múltiples archivos relacionados para explicar, documentar o traducir código antiguo.
- Educación y formación: puede usarse como tutor de programación que explica conceptos, revisa soluciones y propone ejercicios, todo en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona un espacio futuro (https://huggingface.co/spaces/steampunque/benchlm) donde se publicarán evaluaciones de código, pero actualmente no hay datos numéricos. La única métrica disponible es la perplejidad (PPL) de la cuantización: 7,7 para Q4_E_H frente a 7,6 para Q4_K_M, lo que indica una pérdida mínima de calidad.

## Requisitos de hardware

- RAM: mínimo 48 GB (el modelo está dimensionado para operar en máquinas con 48 GB de RAM).
- VRAM: se recomienda una GPU de consumo con al menos 8 GB de VRAM, aunque el modelo puede funcionar con menos si se descargan todos los expertos a CPU.
- GPU recomendadas: RTX 4070 (12 GB) o superior; también funciona con GPUs de 8 GB como la RTX 3060, pero con menor rendimiento.
- Configuración óptima: descargar todos los tensores de expertos a CPU mediante `-ot exps=CPU -ngl 99`; el descarga parcial de expertos ralentiza significativamente la generación.
- Rendimiento medido (en una CPU Intel 9900K con 128 GB RAM y RTX 4070 12 GB): 23 tokens/s con contexto de 256K y expertos en CPU; el procesamiento de prompts es lento (~70 tokens/s), por lo que no es práctico para prompts muy grandes sin una CPU más potente o descarga completa en GPU.
- Opciones de despliegue: llama.cpp (compatible con GGUF), Ollama (si se añade el archivo), y cualquier runtime que soporte GGUF con offload de tensores.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. Según la documentación de Unsloth, Qwen3-Coder-Next es comparable al rendimiento de modelos con 10-20 veces más parámetros activos, pero no se especifican nombres concretos. Para una comparativa justa, se necesitarían benchmarks estandarizados (HumanEval, MBPP, etc.) que no están disponibles en este repositorio. Se recomienda consultar el espacio de benchmarks del autor cuando esté publicado.

## Limitaciones y advertencias

- Sensibilidad a la cuantización: el autor indica que el modelo es muy sensible a la degradación por cuantización, lo que puede afectar negativamente a la generación de código funcional. La cuantización Q4_E_H fue optimizada para un conjunto pequeño de prompts, por lo que puede fallar en otros casos.
- Sin decodificación especulativa: la atención recurrente impide la especulación estándar, lo que limita la velocidad de generación en comparación con modelos que sí la soportan.
- Procesamiento de prompts lento: con expertos en CPU, el prompt processing es de ~70 tokens/s, lo que hace impracticable el uso de prompts muy largos (por ejemplo, más de 10K tokens) sin una CPU muy potente.
- Requiere offload a CPU: para la mayoría de configuraciones, es necesario descargar los expertos a CPU, lo que aumenta la latencia y reduce el throughput en comparación con una ejecución totalmente en GPU.
- Idiomas: no se ha especificado la lista de idiomas soportados; aunque el modelo base de Qwen suele ser multilingüe, no hay confirmación en esta cuantización.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original (Qwen3-Coder-Next) para asegurar el cumplimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/steampunque/Qwen3-Coder-Next-MP-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Discusión sobre cuantización híbrida en llama.cpp: https://github.com/ggml-org/llama.cpp/discussions/13040
- Espacio de benchmarks (pendiente de publicación): https://huggingface.co/spaces/steampunque/benchlm
- Documentación de Unsloth sobre Qwen3-Coder-Next: https://unsloth.ai/docs/models/qwen3-coder-next
