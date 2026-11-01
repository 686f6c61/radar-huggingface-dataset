# vllm-project/deepseek-v3-random

## Resumen

`vllm-project/deepseek-v3-random` es una copia de un checkpoint de pesos aleatorios con arquitectura DeepSeek-V3, publicada por el equipo de vLLM con fines de integración continua (CI). No es un modelo entrenado: el nombre "random" indica que los pesos no proceden de un proceso de entrenamiento real, sino que han sido inicializados aleatoriamente para verificar la correcta carga, ejecución y compatibilidad del código de la arquitectura `deepseek_v3` dentro de vLLM.

El repositorio es una réplica del original `eagle618/deepseek-v3-random` (commit `b1d566c`), creada el 30 de octubre de 2026 para reducir el riesgo de cadena de suministro, ya que el original residía en una cuenta personal. El contenedor de safetensors declara 4.408.228.128 parámetros y un tamaño de repositorio de 5,1 GB, lo que corresponde a una versión reducida de la arquitectura DeepSeek-V3, no al modelo completo de 671 mil millones de parámetros.

Su relevancia es exclusivamente técnica y de infraestructura: sirve como fixture de pruebas para validar el soporte de DeepSeek-V3 en vLLM (carga de pesos, kernels de atención, código personalizado, cuantización fp8). No debe emplearse para inferencia real ni para evaluación de capacidades, ya que sus pesos carecen de conocimiento aprendido. La licencia Apache 2.0 se hereda del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V3 (`deepseek_v3`, con `custom_code`) |
| Parametros totales | 4.408.228.128 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (declarado en tags); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint emplea la arquitectura `deepseek_v3` tal como la define el código personalizado incluido en el repositorio (`custom_code`), lo que implica que vLLM debe cargar implementaciones específicas para esta familia. Los tags indican formato `fp8`, coherente con el esquema de cuantización nativo de DeepSeek-V3 en su versión completa. El recuento de 4.408 millones de parámetros sugiere una instancia reducida de la arquitectura, adecuada para pruebas rápidas en CI y no para representar el modelo completo.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO. El nombre "random" y la nota de la model card confirman que los pesos son aleatorios: no ha habido entrenamiento. Por tanto, no existen innovaciones de entrenamiento que destacar; la única innovación relevante es la propia arquitectura DeepSeek-V3 (MoE con atención MLA en el modelo original), pero sus detalles no se documentan en esta copia.

## Capacidades

- Ninguna capacidad funcional de generación de texto, razonamiento, código o matemáticas: los pesos son aleatorios y no contienen conocimiento aprendido.
- No soporta tool calling ni function calling de forma útil.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No hay capacidades multilingües demostrables.
- Su función real es servir como fixture de pruebas para validar la carga del modelo, el código personalizado y los kernels de vLLM para la arquitectura `deepseek_v3`.

## Casos de uso

- Integración continua de vLLM: el checkpoint se usa en los tests de vLLM para comprobar que la arquitectura `deepseek_v3` se carga correctamente y que el código personalizado se ejecuta sin errores.
- Validación de kernels de atención: permite probar rutas de ejecución de atención específicas de DeepSeek-V3 sin necesidad de descargar el modelo completo de 671 mil millones de parámetros.
- Pruebas de cuantización fp8: al declarar formato fp8, sirve para verificar la conversión y carga de pesos cuantizados en el pipeline de vLLM.
- Desarrollo de herramientas de inspección de modelos: útil para validar parsers de safetensors, lectores de configuración y utilidades de análisis de arquitecturas personalizadas.
- Reproducción de fallos: al ser una copia fija de un commit concreto, permite reproducir bugs de carga o ejecución de forma determinista en entornos de CI.
- Pruebas de humo de despliegue: verifica que un servidor vLLM arranca con un checkpoint de arquitectura DeepSeek-V3 antes de pasar a modelos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería irrelevante.

## Requisitos de hardware

- VRAM estimada: con 4.408 millones de parámetros en fp8, el peso ocupa aproximadamente 4,4 GB; en bf16/fp16 serían unos 8,8 GB. Añadiendo overhead de activaciones y caché KV, se recomienda al menos 8-12 GB de VRAM para inferencia en fp8.
- GPU recomendadas: cualquier GPU con 16 GB o más (RTX 4080, RTX 4090, L40S, A100, H100). Para CI, una GPU de gama media es suficiente.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con holgura, y probablemente en RTX 4070 Ti Super (16 GB) en fp8.
- Opciones de despliegue: vLLM es el destino principal (el repositorio lo mantiene el propio proyecto vLLM). Otras opciones como llama.cpp, Ollama o TGI no están documentadas para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles; al ser un modelo de pruebas, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| vllm-project/deepseek-v3-random | 4.408 M | no disponible | apache-2.0 | Fixture de CI para vLLM |
| deepseek-ai/DeepSeek-V3 (original) | 671.000 M (MoE) | 128K (según documentación pública del original) | licencia propia de DeepSeek | Modelo de produccion |
| eagle618/deepseek-v3-random (original) | no disponible | no disponible | apache-2.0 | Fixture de CI |

La comparación con modelos de producción no es significativa: este checkpoint no compite en calidad ni rendimiento, sino que cumple una función de infraestructura. Frente al DeepSeek-V3 completo, la diferencia de parámetros (4.408 M frente a 671.000 M) confirma que es una instancia reducida para pruebas.

## Limitaciones y advertencias

- Pesos aleatorios: no produce salidas coherentes; cualquier uso en producción generaría texto sin sentido.
- No apto para evaluación de capacidades: los benchmarks no reflejarían el comportamiento del DeepSeek-V3 real.
- Idiomas no documentados: no hay información sobre cobertura lingüística.
- Contexto no documentado: se desconoce la longitud máxima soportada en esta instancia reducida.
- Dependencia de `custom_code`: requiere versiones de vLLM compatibles con la implementación personalizada de `deepseek_v3`; otras herramientas pueden no cargarlo.
- Licencia Apache 2.0: permite uso comercial, pero al no ser un modelo entrenado, esa libertad es irrelevante en la práctica.
- Riesgo de confusión: el nombre puede llevar a pensar que es el DeepSeek-V3 real; conviene revisar la model card antes de descargarlo.
- Copia de un commit concreto: si el original cambia, esta copia no se actualiza automáticamente.

## Enlaces

- HuggingFace (copia vLLM): https://huggingface.co/vllm-project/deepseek-v3-random
- Original: https://huggingface.co/eagle618/deepseek-v3-random
- Repositorio vLLM: https://github.com/vllm-project/vllm
