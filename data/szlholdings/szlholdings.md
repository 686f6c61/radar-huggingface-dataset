# SZLHOLDINGS/SZLHOLDINGS

## Resumen

SZLHOLDINGS/SZLHOLDINGS es un identificador de Hugging Face que no corresponde a un modelo de inteligencia artificial, sino a un "stub" histórico de organización. Fue creado por la organización SZL Holdings con el propósito de preservar un nombre de perfil en el Hub y evitar que ese identificador se confunda con un checkpoint oculto. La model card lo define explícitamente como "not a model" y "not weights", indicando que no contiene pesos, no es entrenable y no admite inferencia.

El repositorio contiene únicamente dos archivos: un `README.md` y un `.gitattributes`. No existe arquitectura, parámetros, contexto, cuantización ni ningún dato técnico asociado. La propia organización redirige a otros repositorios reales, como `SZL-Khipu-1.5B` o `SZL-Forge-1.5B-ReceiptAgent`, que sí son modelos. Por tanto, cualquier intento de cargar este identificador mediante `from_pretrained` fallará.

La relevancia de este perfil es organizativa, no técnica. Sirve para mantener la coherencia del espacio de nombres de SZL Holdings en Hugging Face y para documentar públicamente que este ID no es un modelo. Para desarrolladores e investigadores, la conclusión práctica es que no deben utilizarlo en ningún pipeline de inferencia o entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo) |
| Parametros totales | no disponible (no es un modelo) |
| Parametros activos | no disponible (no es un modelo) |
| Longitud de contexto | no disponible (no es un modelo) |
| Tipos de cuantizacion | no disponible (no es un modelo) |
| Idiomas soportados | no disponible (no es un modelo) |
| Licencia | apache-2.0 (solo para el contenido del stub) |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

No aplica. Este identificador no contiene un modelo. No existe arquitectura, datos de entrenamiento, tokens procesados ni procesos de alineación como RLHF o DPO. La model card especifica que se trata de un perfil vacío con un README y un `.gitattributes`, y que no debe interpretarse como un checkpoint. No se ha publicado ninguna innovación técnica asociada a este ID.

## Capacidades

- Ninguna. No es un modelo y no ofrece capacidades de generacion, razonamiento, codigo, vision, tool calling, agentes ni procesamiento del lenguaje.
- No admite inferencia local ni remota.
- No tiene soporte multilingue ni de ningun tipo.

## Casos de uso

- No aplica. Este identificador no puede utilizarse en ningun escenario practico de desarrollo o investigacion.
- Como referencia organizativa: puede servir para documentar que un nombre de perfil no es un modelo, evitando confusiones en busquedas de Hugging Face.
- Como punto de partida para acceder a los modelos reales de SZL Holdings, a los que la model card enlaza explicitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene evaluaciones ni metricas de ningun tipo, ya que no existe un modelo que evaluar.

## Requisitos de hardware

- No aplica. No hay modelo que ejecutar.
- No requiere VRAM ni GPU.
- No existen opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no hay pesos que servir.

## Comparativa con modelos similares

No disponible. Al no ser un modelo, no existe una categoria comparable. Los modelos reales de SZL Holdings (como `SZL-Khipu-1.5B`) se pueden encontrar en el perfil de la organizacion, pero no son equivalentes a este stub.

## Limitaciones y advertencias

- Este identificador no es un modelo y no debe usarse con `from_pretrained` ni en ningun pipeline.
- No contiene pesos ni datos de entrenamiento.
- La licencia apache-2.0 se aplica solo al contenido textual del stub, no a capacidades de modelo.
- No tiene soporte de inferencia, evaluacion ni despliegue.
- Cualquier intento de usarlo como modelo fallara o producira errores.
- La organizacion recomienda ignorar este perfil y dirigirse a los repositorios de modelos reales que enlaza.

## Enlaces

- Perfil de Hugging Face: https://huggingface.co/SZLHOLDINGS/SZLHOLDINGS
- Organizacion SZL Holdings en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Modelo real sugerido: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Modelo real sugerido: https://huggingface.co/SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent
- Organizacion en GitHub: https://github.com/szl-holdings
- Repositorio szl-serve: https://github.com/szl-holdings/szl-serve/blob/main/README.md
- Medidor de inferencia gobernada: https://huggingface.co/SZLHOLDINGS/governed-inference-meter
- Documentacion de SZL Holdings: https://szl-holdings.github.io/docs-site/
