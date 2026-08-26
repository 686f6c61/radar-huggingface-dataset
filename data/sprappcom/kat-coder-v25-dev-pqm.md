# sprappcom/kat-coder-v25-dev-pqm

## Resumen

El modelo `kat-coder-v25-dev-pqm` es un repack cuantizado del modelo de código abierto Kwaipilot/KAT-Coder-V2.5-Dev, desarrollado por el equipo de Kuaishou. Este modelo base es un MoE (Mixture-of-Experts) de 35 mil millones de parámetros totales, de los cuales solo 3 mil millones se activan por token, y está diseñado específicamente para tareas de generación de código, razonamiento matemático y tool-calling. El repack lo realiza sprappcom, que lo exporta al formato `.pqm`, un contenedor propietario que solo puede ejecutarse en el servidor de inferencia `prism-engine` de BCZ Singapore Pte Ltd.

La relevancia de este modelo radica en su arquitectura híbrida con Gated DeltaNet y atención completa, que combina eficiencia de memoria con capacidad de razonamiento de largo alcance. Sin embargo, su utilidad práctica se ve condicionada por la dependencia de un motor de inferencia propietario y una licencia compuesta: los pesos base son Apache-2.0, pero el empaquetado `.pqm` y el motor `prism-engine` son propietarios. Este modelo no es un entrenamiento original, sino una redistribución cuantizada de un modelo ya existente, lo que limita su atractivo para desarrolladores que buscan soluciones estándar y portables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6-35B-A3B MoE, 40 capas (30 Gated DeltaNet + 10 full attention), 256 expertos enrutados + 1 experto compartido, top-8 routing |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | 3 mil millones (3B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K (embeddings, attn_qkv, attn_output, attn_gate, expertos enrutados), Q6_K (experto compartido, output.weight), F32 (norms, SSM gates) |
| Idiomas soportados | en (ingles) |
| Licencia | Compuesta: pesos base Apache-2.0; empaquetado `.pqm` y `prism-engine` bajo licencia propietaria BCZ (bcz-proprietary) |
| Formato de pesos | `.pqm` (contenedor propietario, no compatible con safetensors, GGUF o transformers) |

## Arquitectura y entrenamiento

El modelo base KAT-Coder-V2.5-Dev es un MoE derivado de Qwen3.6-35B-A3B, con una arquitectura híbrida que combina 30 capas de Gated DeltaNet (una variante de SSM con compuertas) y 10 capas de atención completa. Esta mezcla busca equilibrar el coste computacional con la capacidad de modelar dependencias de largo alcance. El enrutamiento utiliza 256 expertos enrutados más un experto compartido, activando los 8 mejores expertos por token (top-8 routing). El tamaño del vocabulario es de 248320 tokens.

El repack `.pqm` no introduce ningún cambio en los pesos; solo los reempaqueta en un formato propietario con cuantización mixta (Q4_K, Q6_K y F32) para reducir el tamaño y permitir la ejecución en `prism-engine`. No se ha realizado ningún fine-tuning ni merge adicional. Los detalles del entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no se han proporcionado en la información disponible.

## Capacidades

- Generación de código en múltiples lenguajes de programación, con soporte para tool-calling y funciones (function calling).
- Razonamiento matemático y resolución de problemas de programación competitiva.
- Capacidad de agente: puede ejecutar múltiples pasos de razonamiento y llamar a herramientas externas.
- Modelo de texto únicamente; no incluye capacidades de visión en esta versión `.pqm`.
- Soporte multilingüe limitado al inglés, según la información de la model card.
- Decodificación eficiente gracias a la arquitectura MoE con solo 3B parámetros activos por token.

## Casos de uso

- Asistente de programación en entornos de desarrollo integrado (IDE): el modelo puede generar código, autocompletar funciones y sugerir correcciones, aprovechando su capacidad de tool-calling para interactuar con APIs y editores.
- Automatización de tareas de refactorización: puede analizar código existente y proponer cambios estructurales, gracias a su contexto largo (aunque la longitud exacta no está documentada) y su razonamiento multi-paso.
- Agente de resolución de incidencias en repositorios: integrado en pipelines de CI/CD, puede leer issues, generar patches y validar soluciones, como se demuestra en benchmarks como SWE-bench Verified (69.40% en el modelo base).
- Generación de documentación técnica: a partir de fragmentos de código, puede producir explicaciones y comentarios en inglés.
- Tutor de programación: para plataformas educativas, puede explicar conceptos, depurar ejercicios y proporcionar retroalimentación personalizada.
- Integración en herramientas de análisis de código estático: puede detectar errores lógicos y sugerir optimizaciones, aunque requiere el motor propietario `prism-engine` para su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este repack `.pqm` en la información disponible. El modelo base KAT-Coder-V2.5-Dev, según fuentes externas, alcanza un 69.40% en SWE-bench Verified, pero este dato corresponde al modelo original sin cuantizar y no se puede verificar para esta versión. No se dispone de comparaciones con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB para residencia completa en GPU, según la model card.
- GPUs validadas: A100 (sm_80) y tarjetas Ada-Ampere (sm_86/sm_89). Se menciona la posibilidad de usar CPU-RAM offload de expertos en tarjetas con menos memoria.
- No cabe en GPUs de consumo típicas (como RTX 3060 o 4060) sin offload, pero podría ejecutarse en RTX 4090 (sm_89) con 24 GB de VRAM si se usa offload de expertos.
- Despliegue: exclusivamente con `prism-engine` (servidor Rust/CUDA propietario). No es compatible con vLLM, llama.cpp, Ollama ni transformers.
- Latencia y throughput: no disponibles. La model card indica que se debe usar `temperature >= 0.15` para evitar colapso en decodificación greedy.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la información proporcionada. Sin embargo, se puede contextualizar:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev (base) | 35B | 3B | no disponible | Apache-2.0 | Abierta, compatible con vLLM, SGLang, etc. |
| kat-coder-v25-dev-pqm | 35B | 3B | no disponible | Compuesta (Apache-2.0 + propietaria) | Solo con `prism-engine`, acceso restringido |
| DeepSeek-Coder-V2 (ejemplo) | 236B | 21B | 128K | DeepSeek License | Abierta, compatible con frameworks estándar |

Nota: la comparativa con DeepSeek-Coder-V2 es ilustrativa y no se basa en datos verificados de esta ficha.

## Limitaciones y advertencias

- El modelo es solo texto; no incluye capacidades de visión en esta versión `.pqm`. La variante AWQ separada podría incluirlas, pero no está disponible aquí.
- Problema conocido: caída o duplicación intermitente de sub-palabras en prompts de código o aritmética. Se recomienda validar la salida estructurada en producción.
- Licencia compuesta: aunque los pesos base son Apache-2.0, el formato `.pqm` y el motor `prism-engine` son propietarios. El uso comercial requiere una licencia separada de BCZ Singapore Pte Ltd.
- Dependencia total de un motor de inferencia propietario: no se puede ejecutar con herramientas estándar de la comunidad, lo que limita la portabilidad y el ecosistema de herramientas.
- La cuantización Q4_K puede degradar ligeramente la calidad de salida en comparación con el modelo original en precisión completa, aunque no se han publicado evaluaciones comparativas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de código donde la sintaxis puede ser inventada si el contexto es ambiguo.
- El idioma soportado es únicamente inglés; no se garantiza un rendimiento adecuado en otros idiomas.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/sprappcom/kat-coder-v25-dev-pqm)
- [Modelo base Kwaipilot/KAT-Coder-V2.5-Dev](https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev)
- [Blog oficial de KAT-Coder](https://kwaipilot.github.io/KAT-Coder/)
- [Artículo en HackerNoon sobre KAT-Coder-V2.5-Dev](https://hackernoon.com/kat-coder-v25-dev-an-open-agentic-coding-model)
- [Guía de ejecución local de KAT-Coder V2.5](https://www.aimadetools.com/blog/how-to-run-kat-coder-v2-5-locally/)
