# SZLHOLDINGS/szl-receipt-attn

## Resumen

`szl-receipt-attn` no es un modelo de lenguaje ni un sistema de IA generativa, sino un **kernel de atención fusionada** escrito en Triton, desarrollado por SZL Holdings. Su propósito es proporcionar una implementación de atención eficiente (similar en silueta a FlashAttention) que, además, emite un **recibo SHA3-256** por cada llamada, encadenable opcionalmente para auditoría y trazabilidad. Este enfoque responde a la necesidad de gobernanza en IA: permite verificar de forma criptográfica que una determinada operación de atención se ejecutó con unos parámetros concretos, sin depender de la confianza en el entorno de ejecución.

El kernel está publicado en Hugging Face como un repositorio de código fuente (librería `kernels`) y en GitHub como espejo canónico. Según la model card, el estado actual es `import-LIVE` en CPU (medido el 2026-08-28), mientras que la ejecución en GPU no está disponible (sin cubin y sin pruebas temporizadas). No se trata de un modelo con pesos, sino de una pieza de infraestructura para cómputo verificable. La licencia es Apache-2.0.

En el contexto de la IA, este kernel se enmarca en la iniciativa de SZL Holdings de construir "infraestructura de IA gobernada", donde las decisiones de un agente pueden ser inspeccionadas y probadas. Aunque no ofrece capacidades de razonamiento o generación, su relevancia radica en la capa de auditoría que aporta a los pipelines de atención.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel Triton de atención fusionada (tiled, estilo FlashAttention) |
| Parametros totales | No aplica (no es un modelo con pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (repositorio de código fuente) |

## Arquitectura y entrenamiento

El kernel implementa una atención escalada por producto punto (SDPA) con enmascaramiento causal, siguiendo una estructura de tiles (bloques) similar a FlashAttention. La implementación está escrita en Triton y se integra como una extensión de PyTorch a través del módulo `szl_receipt_attn`. No hay pesos entrenados ni proceso de entrenamiento; es una función pura que toma `q`, `k`, `v` y un parámetro `causal` y devuelve la salida de atención junto con un objeto `ReceiptChain` que acumula los recibos.

La característica distintiva es la emisión de un recibo SHA3-256 por cada llamada, que se puede encadenar opcionalmente. Esto permite verificar posteriormente que la operación se ejecutó con los tensores de entrada exactos y el modo causal especificado. El repositorio incluye una función `selfcheck` que compara la salida con la referencia de PyTorch (`torch_reference`) y reporta `max_abs_vs_sdpa=0.0`, lo que indica que la salida coincide exactamente con la atención estándar de PyTorch. No se documentan innovaciones adicionales en el entrenamiento, ya que no existe.

## Capacidades

- Ejecución de atención causal y no causal sobre tensores `q`, `k`, `v` de forma eficiente mediante tiles de Triton.
- Emisión de un recibo SHA3-256 por cada llamada, encadenable en un `ReceiptChain` para trazabilidad.
- Verificación de integridad mediante `selfcheck`, que compara la salida con la referencia de PyTorch.
- Integración con PyTorch a través de `get_kernel` desde Kernel Hub, con soporte para `backend="cpu"`.
- Compatibilidad con el ecosistema Triton para compilación en tiempo de ejecución.
- No incluye capacidades de generación de texto, razonamiento, código, visión ni tool calling.

## Casos de uso

- **Auditoría de inferencias de modelos**: en un pipeline de IA donde se necesita demostrar que una determinada atención se calculó con unos valores específicos, el recibo SHA3-256 sirve como prueba criptográfica. Por ejemplo, en cumplimiento normativo para sistemas de IA de alto riesgo.
- **Trazabilidad de decisiones de agentes**: un agente que ejecuta múltiples pasos de atención puede encadenar recibos para reconstruir la secuencia exacta de operaciones, útil para depuración forense o análisis post-mortem.
- **Verificación de integridad en entornos distribuidos**: al ejecutar atención en múltiples nodos, los recibos permiten confirmar que cada nodo realizó el cálculo esperado, sin necesidad de reenviar los tensores completos.
- **Pruebas de regresión en kernels**: los desarrolladores de kernels de atención pueden usar `selfcheck` y los recibos para validar que una nueva optimización produce resultados idénticos a la referencia de PyTorch.
- **Cumplimiento de políticas de gobernanza de IA**: organizaciones que requieren que cada operación de atención quede registrada de forma inmutable pueden integrar este kernel en sus infraestructuras.
- **Investigación en atención verificable**: para experimentos donde se necesita comparar diferentes implementaciones de atención y demostrar que producen el mismo resultado, el recibo y el `selfcheck` proporcionan una base objetiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay mediciones de tokens por segundo ni de consumo energético. El único dato de rendimiento es la verificación de exactitud (`max_abs_vs_sdpa=0.0`) y el estado `import-LIVE` en CPU, pero sin cifras de latencia o throughput.

## Requisitos de hardware

- **CPU**: el kernel está verificado y operativo en CPU, con `import-LIVE` medido. No se especifican requisitos mínimos de CPU, pero al ser Triton, se espera una arquitectura x86-64 moderna con soporte AVX2 o similar.
- **GPU**: actualmente **no disponible**. La model card indica que no hay cubin (binarios CUDA) ni ejecución en GPU probada. Por tanto, no se recomienda su uso en GPU en este estado.
- **Dependencias**: requiere PyTorch y Triton (versión `0.16.1` según el estado). La integración se realiza mediante `get_kernel` de Kernel Hub.
- **Despliegue**: se puede cargar como módulo Python (`szl_receipt_attn`) o mediante `get_kernel("SZLHOLDINGS/szl-receipt-attn", revision="main", trust_remote_code=True)`.
- **Latencia y throughput**: no se han publicado estimaciones.

## Comparativa con modelos similares

No hay una categoría de "modelos" comparable, ya que esto es un kernel de atención. Se puede comparar con otras implementaciones de atención como FlashAttention o SDPA de PyTorch, pero no se dispone de datos de rendimiento publicados para `szl-receipt-attn`. La principal diferencia es la emisión de recibos SHA3-256, que añade una capa de auditoría no presente en las implementaciones estándar. No se han publicado comparativas con FlashAttention u otros kernels.

## Limitaciones y advertencias

- **No es un modelo**: no contiene pesos, no genera texto ni realiza ninguna tarea de IA por sí mismo. Es una pieza de infraestructura.
- **GPU no disponible**: actualmente solo funciona en CPU; la ejecución en GPU no está probada ni soportada.
- **Sin benchmarks**: no hay métricas de rendimiento, lo que impide evaluar su eficiencia frente a alternativas.
- **Dependencia de Triton**: requiere una versión específica de Triton (`0.16.1`) y puede haber problemas de compatibilidad con otras versiones.
- **Riesgo de mal uso**: el recibo SHA3-256 solo garantiza que la operación se ejecutó con los tensores dados; no valida la corrección del modelo ni la calidad de la salida.
- **Licencia Apache-2.0**: permite uso comercial, pero debe incluirse la atribución correspondiente.
- **Advertencia de producción**: al ser un kernel relativamente nuevo y sin pruebas exhaustivas en GPU, no se recomienda su uso en entornos de producción críticos sin una validación adicional.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/SZLHOLDINGS/szl-receipt-attn)
- [Repositorio canónico en GitHub](https://github.com/szl-holdings/szl-receipt-attn)
- [Organización SZL Holdings en GitHub](https://github.com/szl-holdings)
- [Documentación de SZL Holdings](https://szl-holdings.github.io/docs-site/)
- [Developer Hub de SZL Holdings](https://holdings.a-11-oy.com/docs-site/developers/)
- [SZL-Forge-1.5B-ReceiptAgent en FriendliAI](https://friendli.ai/models/SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent)
