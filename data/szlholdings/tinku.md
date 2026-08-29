# SZLHOLDINGS/tinku

## Resumen

Tinku es un artefacto publicado en HuggingFace por SZL Holdings (SZLHOLDINGS) bajo la etiqueta `governed-ai`. Según su model card, se describe como un "órgano de hoja de ruta para decisiones disputadas" y un "encuentro ritual" entre dos autoridades, pero no contiene pesos de modelo: la propia tarjeta indica explícitamente "No weights" y "Weights: none". No se trata de un modelo de lenguaje entrenado, sino de una declaración conceptual o un marcador de posición dentro de la infraestructura de "IA gobernada" que promueve la organización.

La ficha no proporciona arquitectura, tamaño, contexto ni capacidades de inferencia. La model card menciona una "Doctrine v11" con 749 declaraciones, 14 axiomas, 163 "sorries" y 8 pruebas bloqueadas, pero estos son metadatos de un sistema de gobernanza, no especificaciones de un modelo. La licencia es Apache-2.0 y la fecha de creación es agosto de 2026. En resumen, no existe un modelo utilizable para tareas de NLP; es un repositorio simbólico dentro de un ecosistema más amplio de SZL Holdings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (sin pesos publicados) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

No se ha publicado ninguna arquitectura, ya que el repositorio no contiene pesos ni código de modelo. La model card describe un concepto de "encuentro" entre dos autoridades con un "recibo" firmado, pero no hay detalles técnicos sobre capas, atención, mezcla de expertos ni ningún otro componente. Tampoco se indica dataset de entrenamiento, número de tokens, ni proceso de alineación (RLHF, DPO, etc.). La organización SZL Holdings se dedica a "infraestructura de IA gobernada" con pruebas y recibos, pero este artefacto concreto no es un modelo entrenado.

## Capacidades

- No se ha demostrado ninguna capacidad de generación de texto, razonamiento, código o matemáticas.
- No hay soporte de tool calling, function calling ni agentes.
- No hay capacidades multilingües verificables.
- No existe modo de pensamiento, visión ni audio.
- La model card menciona "GGUF as the signed object: FALSE", lo que confirma que no hay pesos cuantizados.

## Casos de uso

- No es posible aplicar este artefacto a casos de uso prácticos de IA generativa, ya que carece de pesos y de interfaz de inferencia.
- Podría servir como referencia conceptual dentro del ecosistema de gobernanza de SZL Holdings, pero no como modelo ejecutable.
- No se recomienda su uso en producción, desarrollo o investigación aplicada.
- Cualquier intento de cargarlo en frameworks como vLLM, llama.cpp u Ollama fallará por ausencia de archivos de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. La model card incluye una tabla de "honestidad" que clasifica los números como "ROADMAP" y la energía como "UNAVAILABLE", lo que refuerza la ausencia de mediciones reales.

## Requisitos de hardware

- No aplica: no hay pesos que cargar ni inferencia que ejecutar.
- No se requiere VRAM ni GPU específica.
- No hay opciones de despliegue compatibles.
- No se pueden estimar latencia ni throughput.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable porque Tinku no es un modelo de lenguaje. No se puede comparar con alternativas como Llama, Mistral o Qwen, ya que carece de arquitectura, pesos y funcionalidad.

## Limitaciones y advertencias

- No contiene pesos: es imposible utilizarlo para cualquier tarea de IA.
- La model card es deliberadamente críptica y no ofrece especificaciones técnicas verificables.
- No hay evidencia de que exista un modelo subyacente; todo apunta a un artefacto simbólico o de gobernanza.
- La licencia Apache-2.0 permite uso comercial del repositorio, pero al no haber modelo, no hay nada que explotar.
- Riesgo de confusión: un desarrollador podría intentar descargar el repositorio esperando un modelo y encontrarse solo con documentación.
- No se han identificado sesgos ni alucinaciones porque no hay sistema que los genere.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SZLHOLDINGS/tinku
- Organización SZL Holdings en HuggingFace: https://huggingface.co/SZLHOLDINGS/models
- GitHub de SZL Holdings: https://github.com/szl-holdings
- Documentación de SZL Holdings: https://szl-holdings.github.io/docs-site/
- Repositorios de SZL Holdings en GitHub: https://github.com/orgs/szl-holdings/repositories
- Sitio a11oy (organismo gobernado): https://a-11-oy.com/living-anatomy
