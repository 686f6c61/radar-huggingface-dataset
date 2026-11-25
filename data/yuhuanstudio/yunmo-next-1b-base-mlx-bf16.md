# yuhuanstudio/Yunmo-Next-1B-Base-MLX-bf16

## Resumen

Yunmo-Next-1B-Base-MLX-bf16 es la conversión a MLX del checkpoint base Yunmo-Next-1B-Base, un modelo de lenguaje de 1.008.058.216 parámetros (aproximadamente 1B) desarrollado por yuhuanstudio. Se distribuye en formato BF16 safetensors con un tamaño de repositorio de 2,0 GB y está pensado para ejecutarse en Apple Silicon mediante la librería MLX. El modelo original es un checkpoint de investigación, no un modelo afinado para producción.

La relevancia técnica de este lanzamiento está en su arquitectura: incorpora Kimi Delta Attention, atención de consultas agrupadas (grouped-query attention) y depth routing, componentes que no forman parte de `mlx-lm`, por lo que el repositorio incluye una implementación MLX autocontenida en el paquete `yunmo_next_mlx/`. Esto lo convierte en un caso de estudio útil para quienes investigan variantes de atención lineal y enrutado por profundidad en entornos Apple.

El modelo está etiquetado para chino (incluido chino tradicional) e inglés, con licencia Apache-2.0. El propio autor advierte de que se trata de un checkpoint de investigación: rinde a nivel de azar en preguntas de conocimiento de opción múltiple, comete errores factuales con frecuencia, puede repetirse hasta el límite de tokens y no tiene ajuste de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Kimi Delta Attention, grouped-query attention y depth routing |
| Parametros totales | 1.008.058.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); el autor reporta validación con FP32, BF16, 8-bit y 4-bit en MLX |
| Idiomas soportados | chino (incluido tradicional) e inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), librería MLX |

## Arquitectura y entrenamiento

La arquitectura combina Kimi Delta Attention con atención de consultas agrupadas y un mecanismo de depth routing. Según la model card, estos componentes no están soportados por `mlx-lm`, de ahí que el repositorio incluya una implementación MLX propia y autocontenida (`yunmo_next_mlx/`) junto con un script de generación (`python -m yunmo_next_mlx.generate`) y una función `encode_chat` que reproduce exactamente los token IDs de la plantilla de chat de `transformers` con el razonamiento desactivado.

No se proporcionan en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor remite a la model card del repositorio de precisión completa (Yunmo-Next-1B-Base) para los detalles de entrenamiento y evaluación. La model card de esta conversión se centra en la validación de fidelidad numérica frente a la versión PyTorch: bits por byte de 0,9174 en FP32 (idéntico a PyTorch), 0,9175 en BF16 y 8-bit, y 0,9254 en 4-bit, medido sobre los primeros 50 artículos de un conjunto de Wikipedia en chino posterior a 2026-10-01.

## Capacidades

- Generación de texto en chino (incluido tradicional) e inglés.
- Conversación multi-turno mediante la plantilla de chat implementada en `encode_chat`, con modo de razonamiento desactivable.
- Razonamiento básico y continuación de texto; el autor señala que el rendimiento en conocimiento de opción múltiple está a nivel de azar.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: la plantilla de chat contempla desactivar el razonamiento, pero no se detalla su funcionamiento.

## Casos de uso

- Investigación en arquitecturas de atención: el paquete `yunmo_next_mlx/` permite estudiar Kimi Delta Attention y depth routing en Apple Silicon sin depender de `mlx-lm`, lo que facilita experimentos comparativos frente a atención estándar.
- Validación de portabilidad MLX frente a PyTorch: los datos de bits por byte y de coincidencia de tokens permiten verificar la fidelidad de la conversión en distintos niveles de cuantización (FP32, BF16, 8-bit, 4-bit).
- Prototipado de chat en local sobre macOS: con 2,0 GB de pesos BF16 y una implementación autocontenida, sirve para probar pipelines de conversación en equipos Apple sin infraestructura de GPU.
- Generación de texto en chino tradicional: el modelo está etiquetado específicamente para chino tradicional, un nicho con menos cobertura que el chino simplificado, útil para pruebas de continuación y formato.
- Docencia y experimentación con cuantización: la tabla de degradación (64/64 tokens idénticos en FP32 y BF16 para chino, 27/64 en 4-bit para inglés) permite ilustrar el impacto real de la cuantización en la fidelidad de salida.
- Base para fine-tuning posterior: al ser un checkpoint base con licencia Apache-2.0, puede servir como punto de partida para ajustes supervisados en dominios concretos, siempre que se asuma su falta de ajuste de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas de fidelidad de la conversión MLX frente a PyTorch:

| Pesos MLX | Bits por byte (Base) | Delta vs PyTorch FP32 |
|---|---:|---:|
| FP32 | 0,9174 | +0,0000 |
| BF16 | 0,9175 | +0,0001 |
| 8-bit | 0,9175 | +0,0001 |
| 4-bit | 0,9254 | +0,0080 |

| Pesos MLX | Chino (Base) | Inglés (Base) | Chat (Instruct) |
|---|---:|---:|---:|
| FP32 | 64 / 64 | 64 / 64 | 64 / 64 |
| BF16 | 64 / 64 | 64 / 64 | 42 / 64 |
| 8-bit | 64 / 64 | 64 / 64 | 42 / 64 |
| 4-bit | 64 / 64 | 27 / 64 | 19 / 64 |

Los valores indican el número de tokens iniciales idénticos a PyTorch FP32 con decodificación greedy y 64 tokens nuevos. El artículo chino de prueba tiene 3.000 tokens y el texto inglés 600 tokens. Toda la validación se ejecutó en Linux con los backends CUDA y CPU de MLX; ni la corrección ni la velocidad se han comprobado en Apple Silicon, y el bucle de decodificación no está optimizado para velocidad.

## Requisitos de hardware

- VRAM/espacio estimado: 2,0 GB para los pesos BF16 publicados; el repositorio completo ocupa 2,0 GB.
- GPU recomendadas: el destino declarado es Apple Silicon mediante MLX; la validación se hizo con backends CUDA y CPU de MLX en Linux.
- Cabe en GPU de consumo: sí, con 1B de parámetros en BF16 el modelo es apto para GPUs de consumo con al menos 4 GB de memoria libre, aunque no se han publicado mediciones de rendimiento en ese hardware.
- Opciones de despliegue: MLX (librería `mlx` más `tokenizers` y `huggingface_hub`), con el paquete propio `yunmo_next_mlx`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica explícitamente que el bucle de decodificación no está optimizado para velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Yunmo-Next-1B-Base-MLX-bf16 | 1.008.058.216 | no disponible | Apache-2.0 | Hugging Face, formato MLX | Checkpoint de investigación con Kimi Delta Attention |
| Yunmo-Next-1B-Base | no disponible | no disponible | Apache-2.0 | Hugging Face, precisión completa | Versión PyTorch de referencia del mismo modelo |
| Alternativas de ~1B de propósito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con modelos de tamaño similar.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor advierte de que el modelo está a nivel de azar en preguntas de conocimiento de opción múltiple y comete errores factuales con frecuencia.
- Riesgo de repetición degenerativa: puede repetirse hasta alcanzar el límite de tokens.
- Sin ajuste de seguridad: no se ha aplicado alineamiento ni filtrado de contenido.
- Idiomas limitados a chino e inglés; no se documenta cobertura de otras lenguas.
- Longitud de contexto no documentada, lo que impide planificar usos con ventanas largas.
- Fidelidad de la conversión MLX: en chat con pesos BF16 y 8-bit solo coinciden 42 de 64 tokens con PyTorch, y en 4-bit baja a 19/64; en inglés con 4-bit, 27/64. La cuantización degrada la fidelidad de forma notable.
- Validación incompleta: corrección y velocidad no se han verificado en Apple Silicon, y el backend de decodificación no está optimizado.
- Licencia Apache-2.0 permite uso comercial, pero la calidad del modelo y la ausencia de ajuste de seguridad desaconsejan su uso en producción sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Base-MLX-bf16
- Modelo base de precisión completa: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Base
