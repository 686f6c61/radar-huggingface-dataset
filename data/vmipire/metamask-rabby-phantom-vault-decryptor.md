# vmipire/metamask-rabby-phantom-vault-decryptor

## Resumen

`vmipire/metamask-rabby-phantom-vault-decryptor` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows x64 (build etiquetada como `v4.4.3` / `A4C650`) distribuido como archivo ZIP de 4,8 MB con contraseña de descompresión, cuya model card describe funcionalidades de extracción de material criptográfico: auditoría de tokens ERC20/SPL, resolución de mnemónicos BIP39 parciales, parseo de keystores LevelDB de extensiones de navegador y exportación estructurada de saldos.

El artefacto no presenta pipeline, arquitectura de red neuronal, pesos, tokenizador ni parámetros. Los campos de Hugging Face asociados (tags `windows`, `x64`, `portable`) y el contenido del README apuntan a un binario empaquetado, no a un modelo entrenado. Por tanto, esta ficha documenta el repositorio tal como aparece publicado y advierte de su naturaleza.

La relevancia técnica aquí no es la de un modelo evaluable, sino la de un caso de contenido potencialmente malicioso publicado en un hub de modelos. La model card incluye enlaces de descarga a repositorios de GitHub de terceros, una contraseña de archivo (`2026`) y una petición explícita de ejecución como administrador, un patrón habitual en campañas de distribución de software no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows x64 empaquetado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en metadatos y model card) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio no incluye pesos, configuración de transformer, tokenizador ni dataset. La model card describe módulos de un ejecutable (`solara-executor-v3-keyless-2026-v1.2.2-win64.exe`) con supuestas rutinas de validación BIP39, hashing PBKDF2 paralelo sobre CPU con SIMD, parseo de bases LevelDB y exportación de informes de saldos.

Los únicos datos técnicos verificables en la información proporcionada son de empaquetado: tamaño de 4,8 MB, plataforma objetivo Windows 10 (22H2) y Windows 11 (24H2), contraseña de descompresión `2026` y build `A4C6500844`. No hay información sobre datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia, porque no aplica.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No ofrece capacidades multilingües de comprensión o generación; los idiomas listados son metadatos del repositorio.
- El README atribuye al binario funciones de auditoría de tokens, reconstrucción de mnemónicos parciales, validación BIP39 offline, parseo de keystores LevelDB y exportación de saldos. Estas afirmaciones provienen exclusivamente de la model card y no están verificadas.

## Casos de uso

- Ninguno recomendado en producción: el artefacto no es un modelo y su ejecución implica lanzar un binario de origen no verificado como administrador.
- Evaluación de seguridad defensiva: analizar el ZIP y el `.exe` en un entorno aislado (sandbox, VM sin red) para caracterizar el comportamiento real frente a lo declarado en la model card.
- Investigación de campañas de malware: documentar el patrón de distribución (repositorio en hub de modelos, enlaces a GitHub de terceros, contraseña de archivo, instrucción de ejecución con privilegios elevados) como indicador de compromiso.
- Formación en concienciación: usar la model card como ejemplo de ingeniería social dirigida a desarrolladores que buscan herramientas de criptomonedas.
- Auditoría de licencias y cumplimiento: revisar cómo un repositorio con licencia MIT declarada puede alojar contenido ajeno a la finalidad del hub.
- Monitorización de repositorios: alimentar pipelines de moderación que detecten discrepancias entre metadatos de modelo y contenido binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM: no hay modelo ni inferencia neuronal.
- CPU: cualquier x64 compatible con Windows 10 (22H2) o Windows 11 (24H2), según la model card.
- RAM: el README declara consumos inferiores a 64 MB y 42 MB en determinados módulos; no verificable.
- GPU: no disponible; el artefacto descrito es de ejecución en CPU.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI. El único artefacto es un `.exe` empaquetado en ZIP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Frente a un LLM open source real (por ejemplo, una familia de transformers con pesos en safetensors y contexto documentado), este artefacto carece de parámetros, contexto, benchmarks y formato de pesos, por lo que cualquier comparación técnica sería inválida.

## Limitaciones y advertencias

- No es un modelo de IA: los metadatos de Hugging Face (tags, idiomas, licencia) no reflejan un artefacto entrenado.
- Riesgo de seguridad alto: la model card enlaza descargas fuera de Hugging Face, exige contraseña de archivo e indica ejecutar como administrador. Este patrón es consistente con distribución de software no verificado.
- Posible contenido malicioso: las funciones declaradas (extracción de mnemónicos, descifrado de vaults de MetaMask, Rabby y Phantom, parseo de keystores) apuntan a robo de material criptográfico si el binario hace lo que dice.
- Licencia MIT declarada: no garantiza la legitimidad ni la seguridad del binario; una licencia permisiva no equivale a auditoría de código.
- Sin trazabilidad: 0 descargas y 0 likes en el momento de la consulta, sin pipeline ni pesos que permitan reproducibilidad.
- Sin verificación de integridad: no se ofrecen hashes, firmas ni código fuente del ejecutable.
- No usar en producción ni en máquinas con acceso a wallets, claves o credenciales.
- Los idiomas listados son etiquetas del repositorio, no capacidades lingüísticas demostradas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vmipire/metamask-rabby-phantom-vault-decryptor
- Enlace de descarga citado en la model card (GitHub de terceros, no verificado): https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- Releases citadas en la model card (GitHub de terceros, no verificado): https://github.com/MepageHas93/metamask-rabby-phantom-vault-decryptor/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible
