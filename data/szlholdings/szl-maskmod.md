# SZLHOLDINGS/szl-maskmod

## Resumen

SZLHOLDINGS/szl-maskmod es un kernel de atención para PyTorch desarrollado por SZL Holdings, una organización centrada en infraestructura de IA gobernada y auditable. No se trata de un modelo de lenguaje ni de un modelo de machine learning en el sentido convencional, sino de un componente de software que implementa una operación de atención con máscara (masked attention) sobre CPU, basada en la técnica Flex-silhouette con `score_mod` y block-mask. El repositorio en Hugging Face actúa como espejo de publicación del código fuente, que reside en GitHub.

El kernel está en estado "import-LIVE" según la propia model card, lo que significa que la función `get_kernel` funciona correctamente en CPU con la librería `kernels` (versión 0.16.1). La implementación no requiere GPU y ha sido verificada mediante un `selfcheck` que compara la salida con una atención causal estándar (`sdpa_causal`), reportando una diferencia máxima absoluta de aproximadamente 2.38e-07. El proyecto se presenta bajo licencia Apache-2.0 y se enmarca en un sistema más amplio de "governed AI" con conceptos como `ReceiptChain` y `selfcheck`.

La relevancia de este repositorio radica en su contribución a la investigación y desarrollo de kernels de atención eficientes y auditables en entornos de CPU, así como en su integración con el ecosistema de SZL Holdings para decisiones inspeccionables. No obstante, es importante señalar que no ofrece soporte GPU (ni Flash, ni Sage, ni Flex, ni Triton) y que no está diseñado como un modelo de generación de texto o razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de atención con máscara (Flex-silhouette, `score_mod` + block-mask) |
| Parametros totales | No aplica (no es un modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende de la entrada) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (código fuente, módulo Python `szl_maskmod`) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino un kernel de atención diseñado para ejecutarse en CPU. La arquitectura se basa en la técnica "Flex-silhouette" de PyTorch, que combina `score_mod` (modificación de puntuaciones de atención) con block-mask (enmascaramiento por bloques) para implementar atención causal eficiente. El kernel se carga mediante `get_kernel("SZLHOLDINGS/szl-maskmod", revision="main", trust_remote_code=True)` y expone la función `maskmod_attn` que acepta tensores `q`, `k`, `v` y un parámetro `causal`.

No hay información sobre entrenamiento, ya que no se trata de un modelo de lenguaje. El proyecto se centra en la correcta implementación y verificación del kernel, incluyendo un `selfcheck` que valida la salida contra la atención causal estándar de PyTorch. El repositorio también incluye conceptos como `ReceiptChain`, que forma parte del sistema de gobernanza de SZL Holdings para trazabilidad de operaciones.

## Capacidades

- Implementación de atención causal con máscara sobre CPU, mediante la función `maskmod_attn`.
- Soporte de `backend="cpu"` como variante explícita, además del backend por defecto `torch-universal`.
- Incluye un mecanismo de autoverificación (`selfcheck`) que compara la salida con `sdpa_causal` y reporta la diferencia máxima absoluta.
- Integración con el sistema de "receipts" (`ReceiptChain`) de SZL Holdings, orientado a auditoría y trazabilidad.
- Compatible con la librería `kernels` de Hugging Face (versión 0.16.1) mediante `get_kernel`.
- No ofrece capacidades de generación de texto, razonamiento, código, visión ni tool calling, al no ser un modelo de lenguaje.

## Casos de uso

- Investigación en kernels de atención eficientes para CPU: el kernel puede utilizarse como referencia para estudiar la implementación de atención con máscara mediante `score_mod` y block-mask, y comparar su rendimiento con otras variantes.
- Desarrollo de infraestructura de IA gobernada: al integrarse con `ReceiptChain` y `selfcheck`, es útil en entornos donde se requiere auditoría de operaciones de atención, por ejemplo, en sistemas de decisión con requisitos de inspeccionabilidad.
- Pruebas de portabilidad de kernels entre frameworks: el repositorio sirve como ejemplo de cómo empaquetar un kernel en Hugging Face con `library_name: kernels` y cargarlo mediante `get_kernel`, lo que puede guiar a desarrolladores que quieran distribuir sus propios kernels.
- Validación de corrección numérica: el `selfcheck` con tolerancia de ~2.38e-07 permite verificar que la implementación es fiel a la atención causal estándar, útil para tests de regresión en librerías de atención.
- Entornos sin GPU: dado que el kernel funciona exclusivamente en CPU, es adecuado para despliegues en máquinas sin aceleradores gráficos, como ciertos servidores o entornos de edge computing, donde se necesite atención con máscara.
- Formación y docencia: al ser un código abierto y bien documentado (con estado de importación verificado), puede emplearse como material didáctico para explicar la implementación de atención eficiente en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay mediciones de tokens por segundo ni de consumo energético ("no tokens/s; no joules"). Tampoco se ofrecen comparativas de rendimiento con otras implementaciones de atención. El único dato cuantitativo es la diferencia máxima absoluta del `selfcheck`, que es de 2.384185791015625e-07 frente a `sdpa_causal`, lo que confirma la corrección numérica, pero no aporta información sobre velocidad o eficiencia.

## Requisitos de hardware

- El kernel está diseñado para CPU exclusivamente; no requiere GPU.
- No hay requisitos específicos de VRAM, ya que no se utilizan aceleradores gráficos.
- La memoria dependerá del tamaño de los tensores de entrada (`q`, `k`, `v`), que en el ejemplo son de dimensiones `(1, 2, 8, 16)`.
- Se necesita una instalación de PyTorch con soporte para `score_mod` y block-mask (Flex-silhouette), lo que implica una versión reciente de PyTorch (posiblemente 2.x con características experimentales).
- La librería `kernels` (versión 0.16.1) debe estar instalada para usar `get_kernel`.
- No se requiere ninguna tarjeta gráfica específica; cualquier CPU moderna con soporte para operaciones vectoriales será suficiente para ejecutar el kernel.
- El despliegue se realiza mediante la carga del kernel desde Hugging Face o desde el repositorio de GitHub, sin necesidad de servidores de inferencia como vLLM u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje ni un modelo de machine learning comparable con alternativas como Llama, Mistral o Qwen. Se trata de un kernel de atención, y no se han identificado otros kernels con características equivalentes en la información proporcionada. La propia model card indica que "Not a model. Not listed next to Chaski or Qantu", haciendo referencia a que no se compara con otros modelos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede generar texto, razonar, programar ni realizar tareas de NLP. Cualquier intento de usarlo como tal será infructuoso.
- Soporte GPU no disponible: la implementación no incluye kernels para Flash, Sage, Flex o Triton en GPU. Solo funciona en CPU.
- Estado "advisory": la model card menciona "Conjecture 1 (open) — uniqueness unproven; advisory only", lo que indica que hay una propiedad matemática (unicidad) que no ha sido demostrada formalmente. Esto puede afectar a la confianza en ciertos aspectos teóricos del kernel.
- Sin benchmarks de rendimiento: no hay datos de latencia, throughput ni eficiencia energética, por lo que no se puede evaluar su competitividad frente a otras implementaciones.
- Dependencia de versiones: el kernel requiere la librería `kernels` en una versión específica (0.16.1) y una versión de PyTorch compatible con Flex-silhouette. Cambios en estas dependencias podrían romper la funcionalidad.
- Licencia Apache-2.0: permite uso comercial, pero debe incluirse el aviso de licencia correspondiente en redistribuciones.
- Sin soporte de comunidad: al ser un proyecto de una organización específica, la documentación y el mantenimiento pueden ser limitados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-maskmod
- Organización SZL Holdings en Hugging Face: https://huggingface.co/SZLHOLDINGS/models
- Repositorio en GitHub: https://github.com/szl-holdings/szl-maskmod
- Organización SZL Holdings en GitHub: https://github.com/szl-holdings
- Documentación de SZL Holdings: https://szl-holdings.github.io/docs-site/
- Registro de políticas de modelos: https://github.com/szl-holdings/platform/blob/main/docs/MODEL_POLICY_REGISTRY.md
