# tbhrc/qwen3_5_4b_unsloth_mlx_oq4

## Resumen

El modelo `tbhrc/qwen3_5_4b_unsloth_mlx_oq4` es una cuantizacion en 4 bits del modelo Qwen3.5-4B de Alibaba, realizada con el framework oQ (mixed-precision quantization) y exportada en formato MLX safetensors. El autor, tbhrc, ha publicado este repositorio como parte de la serie Qwen3.5, una familia de modelos hibridos de razonamiento multimodal que incluye desde 0.8B hasta 397B parametros. La cuantizacion reduce el modelo original a aproximadamente 1.025 millones de parametros efectivos, con un tamaño de repositorio de 3.2 GB, lo que lo hace adecuado para entornos con recursos limitados.

El modelo se presenta como una opcion para desarrolladores que trabajan con MLX en hardware Apple Silicon, ofreciendo una alternativa cuantizada del modelo base. Aunque el repositorio no incluye informacion detallada sobre la licencia, los idiomas soportados ni los datos de entrenamiento, la familia Qwen3.5 es conocida por su soporte multilingue, razonamiento hibrido y capacidades de agentes. Este modelo en particular esta optimizado para inferencia eficiente en entornos locales con cuantizacion de 4 bits y grupo de tamaño 64, lo que reduce significativamente la huella de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer hibrido con razonamiento multimodal) |
| Parametros totales | 1.025.399.296 (cuantizados) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, parte de la serie Small de Qwen3.5 de Alibaba. Se trata de un modelo de razonamiento hibrido multimodal, disenado para alternar entre modos de pensamiento rapido y profundo. La arquitectura combina mecanismos de atencion tradicionales con componentes de razonamiento hibrido, lo que permite un equilibrio entre eficiencia y capacidad de razonamiento complejo. El modelo fue cuantizado con oQ, un framework de cuantizacion de precision mixta que optimiza la asignacion de bits entre capas, manteniendo la calidad mientras reduce el peso. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO, ya que el repositorio no las detalla.

## Capacidades

- Generacion de texto y razonamiento hibrido: puede alternar entre modos de pensamiento rapido y profundo, segun la configuracion.
- Razonamiento multimodal: aunque no se detalla en el repositorio, la familia Qwen3.5 es multimodal, soportando texto e imagenes.
- Soporte multilingue: la familia Qwen3.5 soporta multiples idiomas, aunque no se especifica la lista exacta para esta variante.
- Capacidades de agente y tool calling: los modelos Qwen3.5 incluyen soporte para funciones de llamada y agentes, aunque no se confirma en este repositorio.
- Cuantizacion eficiente: la cuantizacion oQ permite inferencia en dispositivos con memoria limitada, como Apple Silicon.

## Casos de uso

- Inferencia local en Apple Silicon: gracias al formato MLX y la cuantizacion 4 bits, es adecuado para ejecutar el modelo en MacBooks y otros dispositivos con chip Apple, sin necesidad de GPU dedicada.
- Prototipado rapido de aplicaciones de IA: su tamaño reducido permite experimentar con Qwen3.5-4B en entornos de desarrollo sin requisitos de hardware exigentes.
- Razonamiento en aplicaciones de chat: el modo hibrido permite respuestas rapidas para consultas simples y razonamiento profundo para problemas complejos.
- Generacion de codigo y asistencia tecnica: aunque no se detalla, la familia Qwen3.5 tiene capacidades de codigo, util para entornos de desarrollo.
- Educacion y aprendizaje: como modelo pequeno, es util para estudiar el comportamiento de la familia Qwen3.5 en tareas de razonamiento sin necesidad de grandes recursos.
- Integracion en aplicaciones moviles: el formato MLX y el tamaño reducido facilitan su integracion en aplicaciones iOS o macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado tiene 1.025 millones de parametros, lo que requiere aproximadamente 3.2 GB de almacenamiento. En inferencia, la VRAM necesaria es de unos 4-6 GB, dependiendo del contexto y la configuracion.
- GPU recomendadas: esta optimizado para Apple Silicon (M1, M2, M3, M4), aunque puede ejecutarse en cualquier GPU con suficiente VRAM.
- Compatibilidad con GPU de consumo: si, cabe en GPU de consumo con 8 GB o mas de VRAM, como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: MLX para Apple Silicon, tambien puede convertirse a GGUF para usarlo con llama.cpp o Ollama.
- Latencia y throughput: no se han proporcionado datos concretos, pero en Apple Silicon se espera una latencia baja para un modelo de 1B parametros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B (base) | 4B | no disponible | no disponible | no disponible |
| Qwen3.5-0.8B | 0.8B | no disponible | no disponible | no disponible |
| Qwen3.5-2B | 2B | no disponible | no disponible | no disponible |
| Qwen3.5-9B | 9B | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni licencias para comparar con modelos similares.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero como modelo basado en datos web, puede presentar sesgos linguisticos o culturales.
- Riesgo de alucinacion: al ser un modelo pequeno y cuantizado, puede presentar mayor riesgo de alucinacion que modelos mas grandes.
- Limitaciones de contexto: la longitud de contexto no esta especificada, pero en modelos de 4B suele ser de 32K tokens, aunque no se confirma.
- Restricciones de licencia: la licencia no esta disponible en el repositorio, por lo que se recomienda verificar los terminos de uso de la familia Qwen3.5 en el sitio oficial de Qwen.
- Advertencia de produccion: la cuantizacion puede afectar la calidad del modelo en tareas complejas, por lo que se recomienda evaluar el modelo en escenarios especificos antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tbhrc/qwen3_5_4b_unsloth_mlx_oq4
- Documentacion de Qwen3.5 (Unsloth): https://unsloth.ai/docs/models/qwen3.5
- Coleccion Qwen3.5 en HuggingFace: https://huggingface.co/collections/unsloth/qwen35
- Repositorio oQ (omlx): https://github.com/jundot/omlx
