# tencent/Hy-Memory-30B-A3B-GGUF

## Resumen

Hy-Memory-30B-A3B-GGUF es la versión cuantizada en formato GGUF de Hy-Memory-30B-A3B, un modelo desarrollado por Tencent Hunyuan para actuar como escritor de memoria a largo plazo dentro de frameworks externos. No es un modelo generalista pensado para responder al usuario final, sino un componente especializado que decide qué información conservar, cómo representarla y cómo actualizar un banco de memoria persistente.

El modelo base tiene 30.064.725.888 parámetros totales y aproximadamente 3B activos, según la nomenclatura A3B y la información del autor. Se entrena en dos etapas, Memory On-Policy Distillation y Attributed Memory Reinforcement Learning, y está diseñado para sustituir al LLM genérico en la ruta de escritura de Mem0, MemOS y Hy-Memory, con transferencia a frameworks no vistos como EverMemOS.

La versión GGUF facilita la inferencia local con llama.cpp mediante tres cuantizaciones: Q6_K imatrix, Q8_0 y Q4_K_M imatrix. La licencia es Apache-2.0, los idiomas documentados son inglés y chino, y la longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; la nomenclatura A3B y los ~3B activos son compatibles con un modelo MoE, pero no se confirma en la información |
| Parámetros totales | 30.064.725.888 |
| Parámetros activos | ~3B (indicado por el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q6_K imatrix, Q8_0, Q4_K_M imatrix |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF para llama.cpp; modelo base disponible por separado |
| Modelo base | tencent/Hy-Memory-30B-A3B |
| Tamaño del repositorio | 74,9 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. El sufijo A3B y los aproximadamente 3B parámetros activos indican un diseño de mezcla de expertos (MoE), aunque la model card no lo confirma de forma explícita. La versión de este repositorio es una conversión GGUF del modelo original, no un entrenamiento nuevo.

El entrenamiento se organiza en dos etapas. Primero se aplica Memory On-Policy Distillation (OPD), con supervisión densa de un profesor sobre cadenas de estado escritas por el alumno. Después se aplica Attributed Memory Reinforcement Learning: el modelo examina los bancos de memoria resultantes, asigna crédito a nivel de fragmento y traslada el banco seleccionado entre ventanas. El modelo se entrena dentro de las mismas configuraciones de harness que se despliegan en producción, lo que busca alinear la escritura de memoria con el comportamiento real de Mem0, MemOS y Hy-Memory. No se especifican el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Escritura de memoria persistente: decide qué información retener, cómo representarla y cómo actualizar el banco de memoria cuando llega evidencia nueva.
- Generación de texto conversacional orientada a la construcción de estado, no a la respuesta final al usuario.
- Integración como componente writer en Mem0, MemOS y Hy-Memory, con cobertura de escenarios Chat, Working y Coding.
- Transferencia a frameworks de memoria no vistos durante el entrenamiento, como EverMemOS, según la evaluación del autor.
- Evaluación en tareas de memoria: LoCoMo Judge, LongMemEval, PersonaMem-v2, Travel SPS, Shopping PS y Code Memory Bench.
- Funcionamiento en modo no-think para la evaluación GGUF, según la configuración reportada.
- Soporte de inglés y chino.
- No se documenta soporte de tool calling, function calling, visión, audio ni agentes generales.

## Casos de uso

- Asistente personal multi-turno: usar el modelo como writer de Mem0 para extraer preferencias, restricciones y datos estables del usuario, y actualizar el banco de memoria entre sesiones. Es adecuado porque ha sido entrenado específicamente para decidir qué conservar y cómo representarlo.
- Atención al cliente automatizada: integrarlo como componente de memoria para recordar el producto, las incidencias y las condiciones del cliente a lo largo de varias conversaciones. No debe usarse como generador final de respuestas, sino como capa de persistencia dentro del framework.
- Memoria de usuario y personalización: aplicar el modelo a escenarios de PersonaMem-v2 para mantener un perfil coherente del usuario, sus preferencias
