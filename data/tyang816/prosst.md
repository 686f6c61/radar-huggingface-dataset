# tyang816/ProSST

## Resumen

ProSST es un conjunto de assets de tokenización de estructura de proteínas, publicado por Yang Tan (identificado como tyang816), que se utiliza como componente de los modelos `rem2` y `VenusREM2`. Este repositorio no contiene los pesos de un modelo de lenguaje, sino los recursos necesarios para convertir estructuras tridimensionales de proteínas en tokens: un autoencoder (`AE.pt`) y vocabularios k-means de distintos tamaños (K ∈ {20, 64, 128, 512, 1024, 2048, 4096}).

El modelo conceptual subyacente, `ProSST` (Presentado en NeurIPS 2024), es un transformer que combina cuantización de estructura con atención disentangled. Esta atención separa las interacciones de la secuencia de aminoácidos y de la estructura, evitando mezclarlas en un único flujo de tokens. El repositorio es relevante para investigadores que trabajan con representaciones de proteínas y que necesitan tokenizar estructuras para preentrenamiento o tareas posteriores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los assets corresponden a un autoencoder y vocabularios k-means para tokenización de estructura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | K-means sobre estructura (K ∈ {20, 64, 128, 512, 1024, 2048, 4096}) |
| Idiomas soportados | no disponible (no aplica; es un modelo de estructura de proteínas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Joblib (vocabularios `.joblib`), PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El repositorio contiene dos tipos de ficheros. `static/AE.pt` es un autoencoder utilizado como tokenizer de estructura para todos los tamaños de vocabulario de ProSST. Los ficheros `static/{K}.joblib` almacenan vocabularios k-means para K ∈ {20, 64, 128, 512, 1024, 2048, 4096}. El ensamblaje oficial de VenusREM2 emplea K ∈ {20, 128, 512, 1024, 2048, 4096}, excluyendo el valor 64.

Estos assets no son los pesos del modelo de lenguaje ProSST. El modelo ProSST, descrito en el trabajo académico, utiliza atención disentangled para separar las señales de secuencia y estructura. Este mecanismo permite que las interacciones de la secuencia de aminoácidos (patrones evolutivos y químicos) se procesen de forma independiente de las interacciones de la estructura, en lugar de fusionarse en un único flujo de tokens mixtos.

## Capacidades

- Tokenización de estructuras de proteínas mediante autoencoder y agrupación k-means, generando vocabularios discretos de tamaño configurable (20, 64, 128, 512, 1024, 2048 o 4096 tokens).
- Uso como componente integrado de `rem2` y `VenusREM2` al ejecutarse con las opciones `--model prosst` o `--model venusrem2`.
- Descarga automática y almacenamiento en caché de los ficheros necesarios en `~/.cache/rem2/weights/prosst/static/` en el primer uso.
- Soporta varios tamaños de vocabulario para ensamblajes y experimentos de cuantización.
- No incluye capacidades de generación de texto, vision, audio o tool calling, al tratarse de un tokenizador de estructura y no de un modelo multimodal.

## Casos de uso

- Preentrenamiento de modelos de representación de proteínas: los tokens generados por el autoencoder y el vocabulario k-means se pueden utilizar como entrada para entrenar transformers de estructura, aprovechando la discretización de geometrías tridimensionales.
- Integración en pipelines de predicción de funciones de proteínas: al obtener tokens de estructura, se pueden combinar con embeddings de secuencia para mejorar tareas de anotación funcional.
- Análisis de alineamiento estructural y comparación de conformaciones: la tokenización permite representar estructuras de forma compacta y comparable, facilitando el estudio de cambios conformacionales entre estados de una misma proteína.
- Trabajo con VenusREM2: estos assets son necesarios para ejecutar el conjunto VenusREM2 con distintos valores de K, lo que permite crear representaciones multi-resolución de una misma estructura.
- Investigación en biología computacional: investigadores que quieran experimentar con atención disentangled y cuantización estructural pueden usar estos ficheros como tokenizador de entrada en sus propios pipelines.
- Reproducción de experimentos de ProSST: al usar estos assets junto con el código de rem2, se puede reproducir la tokenización de estructura descrita en el trabajo de NeurIPS 2024.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 0.2 GB, lo que supone una carga ligera para el almacenamiento local.
- VRAM estimada para inferencia: no disponible (no se especifica en la información).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, aunque al tratarse de ficheros de tokenización y no de pesos de red, la carga computacional puede ser baja.
- Opciones de despliegue: los assets se integran con `rem2` y `VenusREM2` y se descargan automáticamente en la caché del sistema. No se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados.

## Limitaciones y advertencias

- Este repositorio no incluye los pesos del modelo de lenguaje ProSST; solo contiene los assets del tokenizador de estructura. Para usar el modelo completo es necesario emplear el código de `rem2` o `VenusREM2`.
- Los vocabularios k-means están limitados a los tamaños K indicados; el valor 64 se utiliza para ProSST individual, pero no en el ensamblaje oficial de VenusREM2.
- No hay datos de sesgos ni evaluaciones de riesgos de alucinación en la información disponible, al tratarse de un componente técnico de tokenización.
- La licencia Apache 2.0 permite uso comercial, pero cualquier implementación derivada debería cumplir con los términos de la licencia y las atribuciones correspondientes.
- El repositorio se actualizó el 2026-09-08 y puede haber dependencias de versiones de rem2 o VenusREM2 que deban verificarse.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/tyang816/ProSST
- Página del proyecto ProSST (NeurIPS 2024): https://tyang816.github.io/projects/prosst/
- Repositorio de VenusREM2 / rem2: https://github.com/tyang816/VenusREM2
