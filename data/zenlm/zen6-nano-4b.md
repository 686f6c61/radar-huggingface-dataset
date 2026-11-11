# zenlm/zen6-nano-4b

## Resumen
Zen 6 Nano (4B) es un modelo multimodal de tipo image-text-to-text desarrollado por Zen LM (Zoo Labs Foundation), concebido como el miembro compacto y orientado a ejecucion local de la familia Zen 6. Se distribuye en formato MLX de 2 bits con transformada de Hadamard (`prism_hadamard_qwen35`, tamano de grupo 128), derivado de `prism-ml/Ternary-Bonsai-2-4B-mlx-2bit` y con `Qwen/Qwen3.5-4B` como modelo base original. Su propuesta central es ofrecer un modelo de 4B con vision integrada en un espacio de almacenamiento de 1,87 GB, pensado para ejecutarse de forma nativa en Apple Silicon mediante Metal.

La arquitectura combina atencion lineal Gated DeltaNet con atencion completa (hibrida), lo que le permite declarar una longitud de contexto nativa de 262.144 tokens sin el coste cuadratico habitual en toda la pila. El modelo integra ademas una cabeza de prediccion multi-token (MTP) en 4 bits, orientada a decodificacion especulativa, y un torre de vision en FP16 de aproximadamente 0,33B de parametros sobre un cuerpo de lenguaje de unos 4,21B.

Es relevante ahora porque ejemplifica la tendencia a comprimir modelos multimodales de 4B en cuantizaciones ternarias de 2 bits sin abandonar ventanas de contexto muy largas, habilitando despliegues en portatiles y equipos de sobremesa con Apple Silicon. La licencia Apache 2.0 y el soporte en `mlx-vlm >= 0.7.8` y `hanzo-engine` facilitan su integracion en flujos de trabajo locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion lineal Gated DeltaNet + atencion completa; torre de vision separada |
| Parametros totales | 4.540.042.240 (4,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | 2 bits MLX affine con Hadamard (grupo 128, bloque 512) para el LM; FP16 para la torre de vision; 4 bits para la cabeza MTP |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con carpeta `mtp/` y `hadamard.json` |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura de transformer hibrido que intercala atencion lineal Gated DeltaNet con capas de atencion completa, un diseno que busca sostener contextos de 262.144 tokens con un coste de memoria y computo contenido. El cuerpo de lenguaje (~4,21B parametros) se almacena en cuantizacion ternaria de 2 bits con transformada de Walsh-Hadamard normalizada (bloque 512, grupo 128), lo que reduce el peso a 1,87 GB incluyendo la torre de vision en FP16 (~0,33B). La cabeza de prediccion multi-token (MTP) se guarda en 4 bits y actua como borrador para decodificacion especulativa.

El modelo se construye sobre `prism-ml/Ternary-Bonsai-2-4B-mlx-2bit`, a su vez derivado de `Qwen/Qwen3.5-4B`. No se ha publicado en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable es la combinacion de cuantizacion ternaria con Hadamard para preservar calidad en 2 bits, junto con la decodificacion especulativa mediante MTP y el soporte nativo en `hanzo-engine` y `mlx-vlm`.

## Capacidades
- Generacion de texto conversacional en ingles y chino.
- Razonamiento y generacion de codigo (el ejemplo de la model card solicita una busqueda binaria en Rust).
- Comprension de imagenes y entrada multimodal image-text-to-text mediante torre de vision FP16.
- Contexto largo nativo de 262.144 tokens, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Decodificacion especulativa mediante cabeza MTP en 4 bits para acelerar la generacion.
- Ejecucion local en Apple Silicon mediante Metal y MLX.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso
- Asistente de codigo en local: el modelo puede generar funciones y fragmentos en lenguajes como Rust o Python directamente en un portatil Apple Silicon, sin conexion a servicios externos, gracias a su huella de 1,87 GB y a la decodificacion especulativa MTP.
- Analisis de documentos largos con imagenes: con 262.144 tokens de contexto y torre de vision, puede procesar informes extensos que combinen texto y figuras en una sola pasada.
- Transcripcion y resumen de reuniones con capturas: al aceptar entrada image-text-to-text, permite resumir presentaciones o pizarras junto con las notas textuales asociadas.
- Atencion al cliente multilingue (en/zh): su ventana de contexto larga permite mantener historiales de conversacion extensos y recuperar informacion de interacciones previas sin truncar.
- Prototipado rapido en investigación: investigadores pueden evaluar tecnicas de cuantizacion ternaria y atencion hibrida en un modelo de 4B con vision, usando `mlx-vlm` o `hanzo-engine` como referencia.
- Extraccion de informacion de capturas y formularios: la combinacion de vision y contexto largo facilita tareas de document understanding en local, con la ventaja de privacidad al no enviar datos a la nube.
- Despliegue en entornos con recursos limitados: al caber en 1,87 GB, puede ejecutarse en equipos con 8-16 GB de memoria unificada, habilitando asistentes embebidos en estaciones de trabajo modestas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM / memoria unificada estimada: aproximadamente 1,87 GB de pesos mas overhead de ejecucion; se recomienda al menos 8 GB de memoria unificada para margen de contexto y KV cache.
- GPU recomendadas: Apple Silicon con soporte Metal (series M1, M2, M3, M4 y superiores). El modelo esta empaquetado en MLX y no se distribuye en formatos CUDA (GGUF, safetensors estandar para vLLM/TGI no disponibles).
- Compatibilidad con GPU consumer: si, en equipos Apple Silicon con al menos 8 GB de memoria unificada; no esta pensado para GPUs NVIDIA consumer en este formato.
- Opciones de despliegue: `hanzo-engine serve -m zen6-nano-4b`, `mlx-vlm >= 0.7.8`, y un cargador MLX autonomo incluido en `runtime/` para versiones antiguas de `mlx-vlm`. vLLM, llama.cpp, Ollama y TGI no estan soportados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zen 6 Nano 4B | 4,54B (4,21B LM + 0,33B vision) | 262.144 | 2 bits MLX + Hadamard, vision FP16 | Apache 2.0 | Hugging Face, MLX |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | no disponible | no disponible | Hugging Face |
| prism-ml/Ternary-Bonsai-2-4B-mlx-2bit (base) | ~4B | no disponible | 2 bits MLX | no disponible | Hugging Face |

La comparativa se limita a los modelos base declarados, ya que no se dispone de datos de rendimiento ni de especificaciones completas de alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a modelos de 4B, agravado por la cuantizacion ternaria de 2 bits, que puede degradar la precision en tareas de razonamiento complejo.
- La cuantizacion a 2 bits con Hadamard puede introducir perdidas de calidad frente al modelo base en FP16; no se han publicado evaluaciones que cuantifiquen esta degradacion.
- El formato esta atado a MLX y Apple Silicon; no hay pesos GGUF ni safetensors estandar para vLLM o TGI, lo que limita el despliegue en infraestructura NVIDIA o en servidores convencionales.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar `NOTICE.txt` y la atribucion a los modelos base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- No se documentan evaluaciones de sesgo, robustez ni seguridad; se recomienda auditoria previa a produccion.
- La cabeza MTP y el formato Hadamard requieren versiones concretas de `mlx-vlm` (>= 0.7.8) o el cargador incluido en `runtime/`.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/zenlm/zen6-nano-4b
- Familia Zen 6: https://huggingface.co/zenlm/zen6
- Modelo base cuantizado: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-mlx-2bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Organizacion Zen LM / Zoo Labs Foundation: https://zoo.ngo
